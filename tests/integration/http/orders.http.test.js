import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundError } from '../../../src/modules/application/errors/not-found.error.js';
import { ValidationError } from '../../../src/modules/domain/errors/validation.error.js';
import { OrderController } from '../../../src/modules/presentation/http/controllers/order.controller.js';
import { httpErrorHandler } from '../../../src/modules/presentation/http/middlewares/error-handler.js';
import { createOrdersRouter } from '../../../src/modules/presentation/http/routes/orders.routes.js';
import { TokenService } from '../../../src/modules/shared/providers/token-service.js';

function createApplication(serviceMock) {
  const app = express();
  app.use(express.json());
  const controller = new OrderController(serviceMock);
  app.use('/orders', createOrdersRouter(controller));
  app.use(httpErrorHandler);
  return app;
}

describe('Integracao HTTP - Pedidos', () => {
  let serviceMock;
  let app;
  let userToken;
  let customerToken;

  beforeEach(() => {
    serviceMock = {
      createOrder: vi.fn(),
      getOrderById: vi.fn(),
      listOrders: vi.fn(),
      listOrdersByCustomer: vi.fn(),
      updateOrderStatus: vi.fn(),
    };
    app = createApplication(serviceMock);
    const tokenService = new TokenService();
    userToken = tokenService.sign({ sub: 'user-1', type: 'USER', role: 'ADMIN' });
    customerToken = tokenService.sign({ sub: 'cust-1', type: 'CUSTOMER' });
  });

  it('deve criar pedido e retornar 201 (fluxo feliz)', async () => {
    serviceMock.createOrder.mockResolvedValue({
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
      status: 'CREATED',
      createdAt: '2026-03-21T18:00:00.000Z',
      updatedAt: '2026-03-21T18:00:00.000Z',
      items: [
        {
          productId: 'prod-1',
          productName: 'Mouse',
          quantity: 2,
          unitPrice: 100,
          getLineTotal: () => 200,
        },
      ],
      getTotalAmount: () => 200,
      getTotalItems: () => 2,
    });

    const response = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        customerId: 'cust-1',
        addressId: 'addr-1',
        items: [{ productId: 'prod-1', quantity: 2 }],
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBe('ord-1');
  });

  it('deve listar pedidos por customerId (fluxo feliz)', async () => {
    serviceMock.listOrders.mockResolvedValue([
      {
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
        totalAmount: 200,
        totalItems: 2,
      },
    ]);

    const response = await request(app).get('/orders?customerId=cust-1').set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(serviceMock.listOrders).toHaveBeenCalledWith({
      customerId: 'cust-1',
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  });

  it('deve listar pedidos pela rota dedicada de cliente (fluxo feliz)', async () => {
    serviceMock.listOrdersByCustomer.mockResolvedValue([
      {
        id: 'ord-2',
        customerId: 'cust-9',
        addressId: 'addr-9',
        deliveryAddress: {
          street: 'Rua 9',
          neighborhood: 'Centro',
          city: 'Fortaleza',
          state: 'CE',
          postalCode: '60000-000',
          complement: null,
        },
        status: 'CREATED',
        createdAt: '2026-03-21T18:00:00.000Z',
        updatedAt: '2026-03-21T18:00:00.000Z',
        items: [
          {
            productId: 'prod-1',
            productName: 'Mouse',
            quantity: 1,
            unitPrice: 100,
            getLineTotal: () => 100,
          },
        ],
        getTotalAmount: () => 100,
        getTotalItems: () => 1,
      },
    ]);

    const response = await request(app).get('/orders/customer/cust-9').set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body[0].items).toHaveLength(1);
    expect(serviceMock.listOrdersByCustomer).toHaveBeenCalledWith('cust-9', {
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  });

  it('deve enviar filtros de status e data na listagem geral (fluxo feliz)', async () => {
    serviceMock.listOrders.mockResolvedValue([]);

    const response = await request(app)
      .get('/orders?status=CREATED&dateFrom=2026-03-01&dateTo=2026-03-31')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(serviceMock.listOrders).toHaveBeenCalledWith({
      customerId: undefined,
      status: 'CREATED',
      dateFrom: '2026-03-01T00:00:00.000Z',
      dateTo: '2026-03-31T23:59:59.999Z',
    });
  });

  it('deve enviar filtros de status e data na rota por cliente (fluxo feliz)', async () => {
    serviceMock.listOrdersByCustomer.mockResolvedValue([]);

    const response = await request(app)
      .get('/orders/customer/cust-1?status=SENT&dateFrom=2026-03-01')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(serviceMock.listOrdersByCustomer).toHaveBeenCalledWith('cust-1', {
      status: 'SENT',
      dateFrom: '2026-03-01T00:00:00.000Z',
      dateTo: undefined,
    });
  });

  it('deve retornar 400 para status inválido no filtro (caso de erro)', async () => {
    const response = await request(app).get('/orders?status=INVALID').set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('status inválido');
  });

  it('deve retornar 404 para pedido inexistente (caso de erro)', async () => {
    serviceMock.getOrderById.mockRejectedValue(new NotFoundError('Pedido não encontrado'));

    const response = await request(app).get('/orders/ord-x').set('Authorization', `Bearer ${customerToken}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Pedido não encontrado');
  });

  it('deve atualizar status do pedido para SENT (fluxo feliz)', async () => {
    serviceMock.updateOrderStatus.mockResolvedValue({
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
      status: 'SENT',
      createdAt: '2026-03-21T18:00:00.000Z',
      updatedAt: '2026-03-21T18:10:00.000Z',
      items: [
        {
          productId: 'prod-1',
          productName: 'Mouse',
          quantity: 1,
          unitPrice: 100,
          getLineTotal: () => 100,
        },
      ],
      getTotalAmount: () => 100,
      getTotalItems: () => 1,
    });

    const response = await request(app).patch('/orders/ord-1/status').set('Authorization', `Bearer ${userToken}`).send({ status: 'SENT' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('SENT');
    expect(serviceMock.updateOrderStatus).toHaveBeenCalledWith('ord-1', 'SENT');
  });

  it('deve cancelar pedido com sucesso (fluxo feliz)', async () => {
    serviceMock.updateOrderStatus.mockResolvedValue({
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
      status: 'CANCELED',
      createdAt: '2026-03-21T18:00:00.000Z',
      updatedAt: '2026-03-21T18:20:00.000Z',
      items: [
        {
          productId: 'prod-1',
          productName: 'Mouse',
          quantity: 1,
          unitPrice: 100,
          getLineTotal: () => 100,
        },
      ],
      getTotalAmount: () => 100,
      getTotalItems: () => 1,
    });

    const response = await request(app)
      .patch('/orders/ord-1/status')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'CANCELED' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('CANCELED');
    expect(serviceMock.updateOrderStatus).toHaveBeenCalledWith('ord-1', 'CANCELED');
  });

  it('deve retornar 400 ao tentar cancelar pedido enviado (caso de erro)', async () => {
    serviceMock.updateOrderStatus.mockRejectedValue(new ValidationError('Pedido enviado ou concluído não pode ser cancelado'));

    const response = await request(app)
      .patch('/orders/ord-1/status')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'CANCELED' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Pedido enviado ou concluído não pode ser cancelado');
  });

  it('deve retornar 403 ao tentar atualizar status com token de cliente para status diferente de CANCELED (caso de erro)', async () => {
    serviceMock.getOrderById.mockResolvedValue({
      id: 'ord-1',
      customerId: 'cust-1',
      status: 'CREATED',
      items: [],
    });

    const response = await request(app)
      .patch('/orders/ord-1/status')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'SENT' });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Clientes só podem cancelar pedidos');
  });

  it('deve retornar 403 ao cliente tentar cancelar pedido com status diferente de CREATED (caso de erro)', async () => {
    serviceMock.getOrderById.mockResolvedValue({
      id: 'ord-sent',
      customerId: 'cust-1',
      status: 'SENT',
      items: [],
    });

    const response = await request(app)
      .patch('/orders/ord-sent/status')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'CANCELED' });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Apenas pedidos criados podem ser cancelados por clientes');
  });
});
