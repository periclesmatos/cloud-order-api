import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../src/modules/infra/database/dynamodb/dynamo-client.js', () => ({
  TABLE_NAME: 'test-table',
  dynamodb: {
    send: vi.fn(),
  },
}));

import { dynamodb } from '../../../../../src/modules/infra/database/dynamodb/dynamo-client.js';
import { Order } from '../../../../../src/modules/domain/entities/order.js';
import { Product } from '../../../../../src/modules/domain/entities/product.js';
import { ValidationError } from '../../../../../src/modules/domain/errors/validation.error.js';
import { OrderDynamoDBRepository } from '../../../../../src/modules/infra/database/dynamodb/order.repository.js';

describe('OrderDynamoDBRepository (unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve montar transação com condição de estoque para evitar corrida (fluxo feliz)', async () => {
    const repository = new OrderDynamoDBRepository();
    const order = Order.create({
      id: 'ord-1',
      customerId: 'cust-1',
      addressId: 'addr-1',
      deliveryAddress: {
        street: 'Rua A',
        neighborhood: 'Centro',
        city: 'Fortaleza',
        state: 'CE',
        postalCode: '60000-000',
        complement: null,
      },
      items: [{ productId: 'prod-1', productName: 'Mouse', quantity: 1, unitPrice: 100 }],
    });
    const product = Product.create({
      id: 'prod-1',
      name: 'Mouse',
      price: 100,
      amount: 0,
      description: 'Mouse para computador',
    });
    product.updatedAt = '2026-03-21T18:00:00.000Z';

    dynamodb.send.mockResolvedValue({});

    await repository.createOrder(order, [
      {
        product,
        expectedAmount: 1,
        expectedUpdatedAt: '2026-03-21T17:59:00.000Z',
      },
    ]);

    const input = dynamodb.send.mock.calls[0][0].input;
    const stockPut = input.TransactItems.find((item) => item.Put?.Item?.PK === 'PRODUCT#prod-1');
    expect(stockPut.Put.ConditionExpression).toContain('#amount = :expectedAmount');
    expect(stockPut.Put.ExpressionAttributeValues[':expectedAmount']).toBe('1');
  });

  it('deve consultar GSI_AllOrders para listagem geral (fluxo feliz)', async () => {
    const repository = new OrderDynamoDBRepository();
    dynamodb.send.mockResolvedValue({ Items: [] });

    await repository.findAll();

    const input = dynamodb.send.mock.calls[0][0].input;
    expect(input.IndexName).toBe('GSI_AllOrders');
  });

  it('deve consultar GSI_OrderByCostumer para listagem por cliente (fluxo feliz)', async () => {
    const repository = new OrderDynamoDBRepository();
    dynamodb.send.mockResolvedValue({ Items: [] });

    await repository.findByCustomerId('cust-1');

    const input = dynamodb.send.mock.calls[0][0].input;
    expect(input.IndexName).toBe('GSI_OrderByCostumer');
    expect(input.ExpressionAttributeValues[':pk']).toBe('CUSTOMER#cust-1');
  });

  it('deve aplicar filtro de status e intervalo de data em findAll (fluxo feliz)', async () => {
    const repository = new OrderDynamoDBRepository();
    dynamodb.send.mockResolvedValue({ Items: [] });

    await repository.findAll({
      status: 'SENT',
      dateFrom: '2026-03-01T00:00:00.000Z',
      dateTo: '2026-03-31T23:59:59.999Z',
    });

    const input = dynamodb.send.mock.calls[0][0].input;
    expect(input.KeyConditionExpression).toContain('AO_SK BETWEEN :dateFrom AND :dateTo');
    expect(input.FilterExpression).toBe('#status = :status');
    expect(input.ExpressionAttributeValues[':status']).toBe('SENT');
  });

  it('deve aplicar filtro de status e intervalo de data em findByCustomerId (fluxo feliz)', async () => {
    const repository = new OrderDynamoDBRepository();
    dynamodb.send.mockResolvedValue({ Items: [] });

    await repository.findByCustomerId('cust-1', {
      status: 'CREATED',
      dateFrom: '2026-03-01T00:00:00.000Z',
    });

    const input = dynamodb.send.mock.calls[0][0].input;
    expect(input.KeyConditionExpression).toContain('OC_SK BETWEEN :dateFrom AND :dateTo');
    expect(input.FilterExpression).toBe('#status = :status');
    expect(input.ExpressionAttributeValues[':status']).toBe('CREATED');
  });

  it('deve montar pedidos detalhados por cliente consultando apenas itens de cada pedido (fluxo feliz)', async () => {
    const repository = new OrderDynamoDBRepository();
    dynamodb.send
      .mockResolvedValueOnce({
        Items: [
          {
            SK: 'PROFILE',
            orderId: 'ord-1',
            customerId: 'cust-1',
            addressId: 'addr-1',
            deliveryAddress: {
              street: 'Rua A',
              city: 'Fortaleza',
              state: 'CE',
              postalCode: '60000-000',
            },
            status: 'CREATED',
            totalAmount: '10000',
            totalItems: '1',
            createdAt: '2026-03-21T00:00:00.000Z',
            updatedAt: '2026-03-21T00:00:00.000Z',
          },
        ],
      })
      .mockResolvedValueOnce({
        Items: [
          {
            SK: 'ITEM#prod-1',
            productId: 'prod-1',
            productName: 'Mouse',
            quantity: '1',
            unitPrice: '10000',
          },
        ],
      });

    const result = await repository.findDetailedByCustomerId('cust-1');

    expect(result).toHaveLength(1);
    const itemsQueryInput = dynamodb.send.mock.calls[1][0].input;
    expect(itemsQueryInput.KeyConditionExpression).toContain('begins_with(SK, :itemPrefix)');
    expect(itemsQueryInput.ExpressionAttributeValues[':itemPrefix']).toBe('ITEM#');
  });

  it('deve atualizar status com condição no status anterior e estorno de estoque (fluxo feliz)', async () => {
    const repository = new OrderDynamoDBRepository();
    const order = Order.create({
      id: 'ord-1',
      customerId: 'cust-1',
      addressId: 'addr-1',
      deliveryAddress: {
        street: 'Rua A',
        neighborhood: 'Centro',
        city: 'Fortaleza',
        state: 'CE',
        postalCode: '60000-000',
        complement: null,
      },
      items: [{ productId: 'prod-1', productName: 'Mouse', quantity: 1, unitPrice: 100 }],
    });
    order.updateStatus('CANCELED');

    const product = Product.create({
      id: 'prod-1',
      name: 'Mouse',
      price: 100,
      amount: 3,
      description: 'Mouse para computador',
    });
    product.updatedAt = '2026-03-21T18:00:00.000Z';

    dynamodb.send.mockResolvedValue({});
    await repository.updateStatus(order, 'CREATED', [{ product, expectedAmount: 2, expectedUpdatedAt: '2026-03-21T17:00:00.000Z' }]);

    const input = dynamodb.send.mock.calls[0][0].input;
    expect(input.TransactItems[0].Put.ConditionExpression).toContain('#status = :previousStatus');
    expect(input.TransactItems[0].Put.ExpressionAttributeValues[':previousStatus']).toBe('CREATED');
    expect(input.TransactItems[1].Put.ExpressionAttributeValues[':expectedAmount']).toBe('2');
  });

  it('deve mapear conflito transacional na criação de pedido (concorrência) para ValidationError', async () => {
    const repository = new OrderDynamoDBRepository();
    const order = Order.create({
      id: 'ord-1',
      customerId: 'cust-1',
      addressId: 'addr-1',
      deliveryAddress: {
        street: 'Rua A',
        neighborhood: 'Centro',
        city: 'Fortaleza',
        state: 'CE',
        postalCode: '60000-000',
        complement: null,
      },
      items: [{ productId: 'prod-1', productName: 'Mouse', quantity: 1, unitPrice: 100 }],
    });
    const product = Product.create({
      id: 'prod-1',
      name: 'Mouse',
      price: 100,
      amount: 0,
      description: 'Mouse para computador',
    });
    product.updatedAt = '2026-03-21T18:00:00.000Z';

    dynamodb.send.mockRejectedValue({ name: 'TransactionCanceledException' });

    await expect(
      repository.createOrder(order, [
        {
          product,
          expectedAmount: 1,
          expectedUpdatedAt: '2026-03-21T17:59:00.000Z',
        },
      ]),
    ).rejects.toThrow(ValidationError);
  });

  it('deve mapear conflito transacional na atualização de status para ValidationError', async () => {
    const repository = new OrderDynamoDBRepository();
    const order = Order.create({
      id: 'ord-1',
      customerId: 'cust-1',
      addressId: 'addr-1',
      deliveryAddress: {
        street: 'Rua A',
        neighborhood: 'Centro',
        city: 'Fortaleza',
        state: 'CE',
        postalCode: '60000-000',
        complement: null,
      },
      items: [{ productId: 'prod-1', productName: 'Mouse', quantity: 1, unitPrice: 100 }],
    });
    order.updateStatus('SENT');

    dynamodb.send.mockRejectedValue({ name: 'TransactionCanceledException' });

    await expect(repository.updateStatus(order, 'CREATED', [])).rejects.toThrow(ValidationError);
  });
});
