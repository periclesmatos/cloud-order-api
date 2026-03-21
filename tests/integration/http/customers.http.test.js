import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CustomerController } from '../../../src/modules/presentation/http/controllers/customer.controller.js';
import { httpErrorHandler } from '../../../src/modules/presentation/http/middlewares/error-handler.js';
import { createCustomersRouter } from '../../../src/modules/presentation/http/routes/customers.routes.js';
import { TokenService } from '../../../src/modules/shared/providers/token-service.js';

function criarAplicacao(serviceMock) {
  const app = express();
  app.use(express.json());
  const customerController = new CustomerController(serviceMock);
  app.use('/customers', createCustomersRouter(customerController));
  app.use(httpErrorHandler);
  return app;
}

describe('Integração HTTP - Clientes', () => {
  let serviceMock;
  let app;
  let customerToken;
  let userToken;

  beforeEach(() => {
    serviceMock = {
      createCustomer: vi.fn(),
      getCustomerById: vi.fn(),
      getCustomerByPhone: vi.fn(),
      updateCustomer: vi.fn(),
      deleteCustomer: vi.fn(),
      createAddress: vi.fn(),
      updateAddress: vi.fn(),
      deleteAddress: vi.fn(),
    };
    app = criarAplicacao(serviceMock);
    const tokenService = new TokenService();
    customerToken = tokenService.sign({ sub: 'cust-2', type: 'CUSTOMER' });
    userToken = tokenService.sign({ sub: 'user-1', type: 'USER', role: 'ADMIN' });
  });

  it('deve criar cliente com sucesso e retornar status 201 (fluxo feliz)', async () => {
    // Arrange
    serviceMock.createCustomer.mockResolvedValue({
      id: 'cust-1',
      name: 'Maria',
      email: 'maria@email.com',
      phone: '+5511999999999',
      createdAt: '2026-03-01T00:00:00.000Z',
      addresses: [],
    });

    // Act
    const resposta = await request(app).post('/customers').send({
      name: 'Maria',
      email: 'maria@email.com',
      phone: '5511999999999',
    });

    // Assert
    expect(resposta.status).toBe(201);
    expect(resposta.body).toEqual({
      id: 'cust-1',
      name: 'Maria',
      email: 'maria@email.com',
      phone: '+5511999999999',
      createdAt: '2026-03-01T00:00:00.000Z',
      addresses: [],
    });
  });

  it('deve retornar 404 ao buscar cliente inexistente por id (caso de erro)', async () => {
    // Arrange
    serviceMock.getCustomerById.mockResolvedValue(null);

    // Act
    const resposta = await request(app)
      .get('/customers/cust-nao-existe')
      .set('Authorization', `Bearer ${userToken}`);

    // Assert
    expect(resposta.status).toBe(404);
    expect(resposta.body.error).toBe('Cliente não encontrado');
  });

  it('deve retornar addresses vazio quando cliente não possui endereço (caso de borda)', async () => {
    // Arrange
    serviceMock.getCustomerById.mockResolvedValue({
      id: 'cust-2',
      name: 'João',
      email: 'joao@email.com',
      phone: '+5585999999999',
      createdAt: '2026-03-01T00:00:00.000Z',
      addresses: [],
    });

    // Act
    const resposta = await request(app)
      .get('/customers/cust-2')
      .set('Authorization', `Bearer ${customerToken}`);

    // Assert
    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body.addresses)).toBe(true);
    expect(resposta.body.addresses).toHaveLength(0);
  });

  it('deve retornar 401 ao buscar cliente por id sem token (caso de erro)', async () => {
    const resposta = await request(app).get('/customers/cust-2');

    expect(resposta.status).toBe(401);
    expect(resposta.body.error).toBe('Token não informado');
  });
});
