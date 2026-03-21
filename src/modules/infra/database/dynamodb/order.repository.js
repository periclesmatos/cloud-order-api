import { QueryCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { ValidationError } from '../../../domain/errors/validation.error.js';
import { dynamodb, TABLE_NAME } from './dynamo-client.js';
import { ProductDynamoDBMapper } from './mappers/product.mapper.js';
import { toDomainOrder, toOrderItem, toOrderProfileItem, toOrderSummary } from './mappers/order.mapper.js';

export class OrderDynamoDBRepository {
  buildDateRangeExpression(sortKeyName, dateFrom, dateTo) {
    if (!dateFrom && !dateTo) {
      return {
        expression: '',
        values: {},
      };
    }

    const from = (dateFrom ?? '0000-01-01T00:00:00.000Z');
    const to = (dateTo ?? '9999-12-31T23:59:59.999Z');

    return {
      expression: ` AND ${sortKeyName} BETWEEN :dateFrom AND :dateTo`,
      values: {
        ':dateFrom': `${from}#`,
        ':dateTo': `${to}#zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz`,
      },
    };
  }

  async createOrder(order, stockUpdates) {
    const orderProfileItem = toOrderProfileItem(order);
    const orderItems = order.items.map((item) => toOrderItem(order, item));

    const transactItems = [
      {
        ConditionCheck: {
          TableName: TABLE_NAME,
          Key: {
            PK: `CUSTOMER#${order.customerId}`,
            SK: 'PROFILE',
          },
          ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
        },
      },
      {
        ConditionCheck: {
          TableName: TABLE_NAME,
          Key: {
            PK: `CUSTOMER#${order.customerId}`,
            SK: `ADDRESS#${order.addressId}`,
          },
          ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
        },
      },
      {
        Put: {
          TableName: TABLE_NAME,
          Item: orderProfileItem,
          ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
        },
      },
      ...orderItems.map((item) => ({
        Put: {
          TableName: TABLE_NAME,
          Item: item,
          ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
        },
      })),
      ...stockUpdates.map(({ product, expectedAmount, expectedUpdatedAt }) => ({
        Put: {
          TableName: TABLE_NAME,
          Item: ProductDynamoDBMapper.toProductItem(product),
          ConditionExpression:
            'attribute_exists(PK) AND attribute_exists(SK) AND #amount = :expectedAmount AND #updatedAt = :expectedUpdatedAt AND #isActive = :isActive',
          ExpressionAttributeNames: {
            '#amount': 'amount',
            '#updatedAt': 'updatedAt',
            '#isActive': 'isActive',
          },
          ExpressionAttributeValues: {
            ':expectedAmount': String(expectedAmount),
            ':expectedUpdatedAt': expectedUpdatedAt,
            ':isActive': true,
          },
        },
      })),
    ];

    if (transactItems.length > 25) {
      throw new ValidationError('Pedido excede limite transacional de itens');
    }

    try {
      await dynamodb.send(
        new TransactWriteCommand({
          TransactItems: transactItems,
        }),
      );
      return order;
    } catch (error) {
      if (error.name === 'TransactionCanceledException') {
        throw new ValidationError('Estoque alterado durante o pedido. Tente novamente');
      }
      throw error;
    }
  }

  async findById(orderId) {
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `ORDER#${orderId}`,
        },
      }),
    );

    const items = result.Items ?? [];
    const profile = items.find((item) => item.SK === 'PROFILE');
    const orderItems = items.filter((item) => item.SK.startsWith('ITEM#'));
    return toDomainOrder(profile, orderItems);
  }

  async findItemsByOrderId(orderId) {
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :itemPrefix)',
        ExpressionAttributeValues: {
          ':pk': `ORDER#${orderId}`,
          ':itemPrefix': 'ITEM#',
        },
      }),
    );

    return result.Items ?? [];
  }

  async findAll(filters = {}) {
    const { status, dateFrom, dateTo } = filters;
    const dateRange = this.buildDateRangeExpression('AO_SK', dateFrom, dateTo);
    const queryInput = {
      TableName: TABLE_NAME,
      IndexName: 'GSI_AllOrders',
      KeyConditionExpression: `AO_PK = :pk${dateRange.expression}`,
      ExpressionAttributeValues: {
        ':pk': 'ORDER',
        ...dateRange.values,
      },
    };

    if (status) {
      queryInput.FilterExpression = '#status = :status';
      queryInput.ExpressionAttributeNames = {
        '#status': 'status',
      };
      queryInput.ExpressionAttributeValues[':status'] = status;
    }

    const result = await dynamodb.send(
      new QueryCommand(queryInput),
    );

    return (result.Items ?? []).filter((item) => item.SK === 'PROFILE').map(toOrderSummary);
  }

  async findByCustomerId(customerId, filters = {}) {
    const { status, dateFrom, dateTo } = filters;
    const dateRange = this.buildDateRangeExpression('OC_SK', dateFrom, dateTo);
    const queryInput = {
      TableName: TABLE_NAME,
      IndexName: 'GSI_OrderByCostumer',
      KeyConditionExpression: `OC_PK = :pk${dateRange.expression}`,
      ExpressionAttributeValues: {
        ':pk': `CUSTOMER#${customerId}`,
        ...dateRange.values,
      },
    };

    if (status) {
      queryInput.FilterExpression = '#status = :status';
      queryInput.ExpressionAttributeNames = {
        '#status': 'status',
      };
      queryInput.ExpressionAttributeValues[':status'] = status;
    }

    const result = await dynamodb.send(
      new QueryCommand(queryInput),
    );

    return (result.Items ?? []).filter((item) => item.SK === 'PROFILE').map(toOrderSummary);
  }

  async findDetailedByCustomerId(customerId, filters = {}) {
    const summaries = await this.findByCustomerId(customerId, filters);
    const orders = await Promise.all(
      summaries.map(async (summary) => {
        const orderItems = await this.findItemsByOrderId(summary.id);
        return toDomainOrder(
          {
            orderId: summary.id,
            customerId: summary.customerId,
            addressId: summary.addressId,
            deliveryAddress: summary.deliveryAddress,
            status: summary.status,
            totalAmount: String(Math.round(summary.totalAmount * 100)),
            totalItems: String(summary.totalItems),
            createdAt: summary.createdAt,
            updatedAt: summary.updatedAt,
          },
          orderItems,
        );
      }),
    );

    return orders;
  }

  async updateStatus(order, previousStatus, stockUpdates = []) {
    const orderProfileItem = toOrderProfileItem(order);

    const transactItems = [
      {
        Put: {
          TableName: TABLE_NAME,
          Item: orderProfileItem,
          ConditionExpression:
            'attribute_exists(PK) AND attribute_exists(SK) AND #status = :previousStatus',
          ExpressionAttributeNames: {
            '#status': 'status',
          },
          ExpressionAttributeValues: {
            ':previousStatus': previousStatus,
          },
        },
      },
      ...stockUpdates.map(({ product, expectedAmount, expectedUpdatedAt }) => ({
        Put: {
          TableName: TABLE_NAME,
          Item: ProductDynamoDBMapper.toProductItem(product),
          ConditionExpression:
            'attribute_exists(PK) AND attribute_exists(SK) AND #amount = :expectedAmount AND #updatedAt = :expectedUpdatedAt',
          ExpressionAttributeNames: {
            '#amount': 'amount',
            '#updatedAt': 'updatedAt',
          },
          ExpressionAttributeValues: {
            ':expectedAmount': String(expectedAmount),
            ':expectedUpdatedAt': expectedUpdatedAt,
          },
        },
      })),
    ];

    if (transactItems.length > 25) {
      throw new ValidationError('Atualização de status excede limite transacional');
    }

    try {
      await dynamodb.send(
        new TransactWriteCommand({
          TransactItems: transactItems,
        }),
      );
      return order;
    } catch (error) {
      if (error.name === 'TransactionCanceledException') {
        throw new ValidationError('Pedido foi atualizado por outro processo. Tente novamente');
      }
      throw error;
    }
  }
}
