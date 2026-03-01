import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CustomerController } from '../../../src/modules/presentation/http/controllers/customer.controller.js';
import { createHttpRoutes } from '../../../src/modules/presentation/http/routes/index.js';

function criarAplicacao(serviceMock) {
  const app = express();
  app.use(express.json());
  const customerController = new CustomerController(serviceMock);
  app.use(createHttpRoutes({ customerController }));
  return app;
}

describe('Integração HTTP - Clientes', () => {
  let serviceMock;
  let app;

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
    const resposta = await request(app).get('/customers/cust-nao-existe');

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
    const resposta = await request(app).get('/customers/cust-2');

    // Assert
    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body.addresses)).toBe(true);
    expect(resposta.body.addresses).toHaveLength(0);
  });
});
