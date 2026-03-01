
import { GetCommand, QueryCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "./dynamo-client.js";
import { ValidationError } from "../../../domain/errors/validation.error.js";
import { logger } from "../../../shared/logger/console-logger.js";
import { toCustomerItem, toDomainCustomer, toPhoneLockItem, toDomainAddress, toCustomerAddressItem } from "./mappers/customer.mapper.js";

export class CustomerDynamoDBRepository {
  chunkTransactItems(transactItems, size = 25) {
    const chunks = [];
    for (let i = 0; i < transactItems.length; i += size) {
      chunks.push(transactItems.slice(i, i + size));
    }
    return chunks;
  }

  async saveCustomer(customer) {
    const customerItem = toCustomerItem(customer);
    const phoneItem = toPhoneLockItem(customer);
    const params = {
      TransactItems: [
        {
          Put: {
            TableName: TABLE_NAME,
            Item: customerItem,
            ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
          },
        },
        {
          Put: {
            TableName: TABLE_NAME,
            Item: phoneItem,
            ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
          },
        },
      ],
    };
    try {
      await dynamodb.send(new TransactWriteCommand(params));
      return customer;
    } catch (error) {
      if (error.name === 'TransactionCanceledException') {
        throw new ValidationError('Telefone já cadastrado para outro cliente');
      }
      throw error;
    }
  }

  async findById(customerId) {
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `CUSTOMER#${customerId}`,
        },
      }),
    );
    
    const items = result.Items || [];
    const customerItem = items.find(item => item.SK === 'PROFILE');
    const addressItems = items.filter(item => item.SK.startsWith('ADDRESS#'));

    if (!customerItem) return null;

    const customer = toDomainCustomer(customerItem);
    customer.setAddresses(addressItems.map(toDomainAddress));
    return customer;
  }

  async findByPhone(phone) {
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `PHONE#${phone}`,
        },
        Limit: 1,
      }),
    );
    const phoneItem = result.Items?.[0];
    return phoneItem ? await this.findById(phoneItem.customerId) : null;
  }

  async update(customer, previousPhone) {
    const customerItem = toCustomerItem(customer);
    const currentPhone = customer.phone.toString();
    const transactItems = [
      {
        Put: {
          TableName: TABLE_NAME,
          Item: customerItem,
          ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
        },
      },
    ];

    if (previousPhone && previousPhone !== currentPhone) {
      transactItems.push({
        Delete: {
          TableName: TABLE_NAME,
          Key: {
            PK: `PHONE#${previousPhone}`,
            SK: 'LOCK',
          },
          ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
        },
      });

      transactItems.push({
        Put: {
          TableName: TABLE_NAME,
          Item: toPhoneLockItem(customer),
          ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
        },
      });
    }

    try {
      await dynamodb.send(
        new TransactWriteCommand({
          TransactItems: transactItems,
        }),
      );
      return customer;
    } catch (error) {
      logger.error('CustomerDynamoDBRepository', 'Erro ao atualizar cliente', error);
      if (error.name === 'TransactionCanceledException') {
        throw new ValidationError('Cliente não encontrado para atualização');
      }
      throw error;
    }
  }

  async findAll() {
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'type-index',
        KeyConditionExpression: 'type = :type',
        ExpressionAttributeValues: {
          ':type': 'CUSTOMER',
        },
      }),
    );
    return result.Items.map(toDomainCustomer);
  }

  async saveAddress(address) {
    const addressItem = toCustomerAddressItem(address);
    try {
      await dynamodb.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              ConditionCheck: {
                TableName: TABLE_NAME,
                Key: {
                  PK: `CUSTOMER#${address.customerId}`,
                  SK: 'PROFILE',
                },
                ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
              },
            },
            {
              Put: {
                TableName: TABLE_NAME,
                Item: addressItem,
                ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
              },
            },
          ],
        }),
      );
      return address;
    } catch (error) {
      logger.error('CustomerDynamoDBRepository', 'Erro ao salvar endereço', error);
      if (error.name === 'TransactionCanceledException') {
        throw new ValidationError('Endereço já existe para este cliente');
      }
      throw error;
    }
  }

  async findAddressById(customerId, addressId) {
    const result = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `CUSTOMER#${customerId}`,
          SK: `ADDRESS#${addressId}`,
        },
      }),
    );

    return toDomainAddress(result.Item);
  }

  async updateAddress(address) {
    const addressItem = toCustomerAddressItem(address);
    try {
      await dynamodb.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Put: {
                TableName: TABLE_NAME,
                Item: addressItem,
                ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
              },
            },
          ],
        }),
      );
      return address;
    } catch (error) {
      logger.error('CustomerDynamoDBRepository', 'Erro ao atualizar endereço', error);
      if (error.name === 'TransactionCanceledException') {
        throw new ValidationError('Endereço não encontrado para atualização');
      }
      throw error;
    }
  }

  async deleteAddress(customerId, addressId) {
    try {
      await dynamodb.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Delete: {
                TableName: TABLE_NAME,
                Key: {
                  PK: `CUSTOMER#${customerId}`,
                  SK: `ADDRESS#${addressId}`,
                },
                ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
              },
            },
          ],
        }),
      );
    } catch (error) {
      logger.error('CustomerDynamoDBRepository', 'Erro ao excluir endereço', error);
      if (error.name === 'TransactionCanceledException') {
        throw new ValidationError('Endereço não encontrado para exclusão');
      }
      throw error;
    }
  }

  async deleteCustomerCascade(customerId) {
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `CUSTOMER#${customerId}`,
        },
      }),
    );

    const items = result.Items ?? [];
    const customerItem = items.find((item) => item.SK === 'PROFILE');
    if (!customerItem) {
      throw new ValidationError('Cliente não encontrado para exclusão');
    }

    const transactItems = items.map((item) => ({
      Delete: {
        TableName: TABLE_NAME,
        Key: {
          PK: item.PK,
          SK: item.SK,
        },
      },
    }));

    transactItems.push({
      Delete: {
        TableName: TABLE_NAME,
        Key: {
          PK: `PHONE#${customerItem.phone}`,
          SK: 'LOCK',
        },
      },
    });

    const chunks = this.chunkTransactItems(transactItems, 25);
    for (const chunk of chunks) {
      await dynamodb.send(
        new TransactWriteCommand({
          TransactItems: chunk,
        }),
      );
    }
  }
}
