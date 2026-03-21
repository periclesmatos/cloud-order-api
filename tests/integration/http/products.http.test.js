import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundError } from '../../../src/modules/application/errors/not-found.error.js';
import { ProductController } from '../../../src/modules/presentation/http/controllers/product.controller.js';
import { httpErrorHandler } from '../../../src/modules/presentation/http/middlewares/error-handler.js';
import { createProductsRouter } from '../../../src/modules/presentation/http/routes/product.routes.js';

function createApplication(serviceMock) {
  const app = express();
  app.use(express.json());
  const productController = new ProductController(serviceMock);
  app.use('/products', createProductsRouter(productController));
  app.use(httpErrorHandler);
  return app;
}

describe('Integracao HTTP - Produtos', () => {
  let serviceMock;
  let app;

  beforeEach(() => {
    serviceMock = {
      createProduct: vi.fn(),
      getProductById: vi.fn(),
      getProductsByName: vi.fn(),
      getAllProducts: vi.fn(),
      updateProduct: vi.fn(),
      deleteProduct: vi.fn(),
      setProductStatus: vi.fn(),
    };
    app = createApplication(serviceMock);
  });

  it('deve atualizar produto e retornar 200 (fluxo feliz)', async () => {
    serviceMock.updateProduct.mockResolvedValue({
      id: 'prod-1',
      name: 'Mouse Gamer',
      price: 120,
      amount: 8,
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
    });

    const response = await request(app).put('/products/prod-1').send({
      name: 'Mouse Gamer',
      price: 120,
      amount: 8,
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'prod-1',
      name: 'Mouse Gamer',
      price: 120,
      amount: 8,
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
    });
  });

  it('deve remover produto e retornar 204 (fluxo feliz)', async () => {
    serviceMock.deleteProduct.mockResolvedValue(undefined);

    const response = await request(app).delete('/products/prod-1');

    expect(response.status).toBe(204);
    expect(serviceMock.deleteProduct).toHaveBeenCalledWith('prod-1');
  });

  it('deve ativar produto via rota de status e retornar 200 (fluxo feliz)', async () => {
    serviceMock.setProductStatus.mockResolvedValue({
      id: 'prod-1',
      name: 'Notebook',
      price: 3000,
      amount: 2,
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
    });

    const response = await request(app).patch('/products/prod-1/status').send({ isActive: true });

    expect(response.status).toBe(200);
    expect(response.body.isActive).toBe(true);
    expect(serviceMock.setProductStatus).toHaveBeenCalledWith('prod-1', true);
  });

  it('deve desativar produto via rota de status e retornar 200 (fluxo feliz)', async () => {
    serviceMock.setProductStatus.mockResolvedValue({
      id: 'prod-1',
      name: 'Notebook',
      price: 3000,
      amount: 2,
      isActive: false,
      createdAt: '2026-03-01T00:00:00.000Z',
    });

    const response = await request(app).patch('/products/prod-1/status').send({ isActive: false });

    expect(response.status).toBe(200);
    expect(response.body.isActive).toBe(false);
    expect(serviceMock.setProductStatus).toHaveBeenCalledWith('prod-1', false);
  });

  it('deve retornar 404 ao atualizar status de produto inexistente (caso de erro)', async () => {
    serviceMock.setProductStatus.mockRejectedValue(new NotFoundError('Produto não encontrado'));

    const response = await request(app).patch('/products/prod-x/status').send({ isActive: true });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Produto não encontrado');
  });

  it('deve listar produtos filtrando por isActive (fluxo feliz)', async () => {
    serviceMock.getAllProducts.mockResolvedValue([
      {
        id: 'prod-1',
        name: 'Produto Ativo',
        price: 50,
        amount: 1,
        isActive: true,
        createdAt: '2026-03-01T00:00:00.000Z',
      },
    ]);

    const response = await request(app).get('/products?isActive=true');

    expect(response.status).toBe(200);
    expect(serviceMock.getAllProducts).toHaveBeenCalledWith({ isActive: true });
    expect(response.body).toHaveLength(1);
    expect(response.body[0].isActive).toBe(true);
  });

  it('deve listar produtos por nome filtrando por isActive (fluxo feliz)', async () => {
    serviceMock.getProductsByName.mockResolvedValue([
      {
        id: 'prod-2',
        name: 'Mouse',
        price: 120,
        amount: 10,
        isActive: true,
        createdAt: '2026-03-01T00:00:00.000Z',
      },
    ]);

    const response = await request(app).get('/products?name=mouse&isActive=true');

    expect(response.status).toBe(200);
    expect(serviceMock.getProductsByName).toHaveBeenCalledWith('mouse', { isActive: true });
    expect(response.body).toHaveLength(1);
  });

  it('deve retornar 400 quando isActive for invalido na query (caso de erro)', async () => {
    const response = await request(app).get('/products?isActive=talvez');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('isActive deve ser true ou false');
  });
});
