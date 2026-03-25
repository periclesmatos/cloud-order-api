import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '../../../src/modules/application/errors/unauthorized.error.js';
import { AuthController } from '../../../src/modules/presentation/http/controllers/auth.controller.js';
import { httpErrorHandler } from '../../../src/modules/presentation/http/middlewares/error-handler.js';
import { createAuthRouter } from '../../../src/modules/presentation/http/routes/auth.routes.js';

function createApplication(serviceMock) {
  const app = express();
  app.use(express.json());
  const authController = new AuthController(serviceMock);
  app.use('/auth', createAuthRouter(authController));
  app.use(httpErrorHandler);
  return app;
}

describe('Integracao HTTP - Auth', () => {
  let serviceMock;
  let app;

  beforeEach(() => {
    serviceMock = {
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      loginCustomer: vi.fn(),
      getMe: vi.fn(),
    };
    app = createApplication(serviceMock);
  });

  it('deve registrar usuário admin e retornar token (fluxo feliz)', async () => {
    serviceMock.registerUser.mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Admin',
        email: { toString: () => 'admin@email.com' },
        role: 'ADMIN',
      },
      accessToken: 'token-register',
      tokenType: 'Bearer',
      expiresIn: 3600,
    });

    const response = await request(app).post('/auth/users/register').send({
      name: 'Admin',
      email: 'admin@email.com',
      password: 'A9!zT7#kL2',
    });

    expect(response.status).toBe(201);
    expect(response.body.user.id).toBe('user-1');
    expect(response.body.accessToken).toBe('token-register');
  });

  it('deve autenticar usuário por e-mail e senha (fluxo feliz)', async () => {
    serviceMock.loginUser.mockResolvedValue({
      actor: { id: 'user-1', type: 'USER' },
      accessToken: 'token-login-user',
      tokenType: 'Bearer',
      expiresIn: 3600,
    });

    const response = await request(app).post('/auth/users/login').send({
      email: 'admin@email.com',
      password: 'A9!zT7#kL2',
    });

    expect(response.status).toBe(200);
    expect(response.body.actor.type).toBe('USER');
    expect(response.body.accessToken).toBe('token-login-user');
  });

  it('deve autenticar cliente por telefone (fluxo feliz)', async () => {
    serviceMock.loginCustomer.mockResolvedValue({
      actor: { id: 'cust-1', type: 'CUSTOMER' },
      accessToken: 'token-login-customer',
      tokenType: 'Bearer',
      expiresIn: 3600,
    });

    const response = await request(app).post('/auth/customers/login').send({ phone: '85999999999' });

    expect(response.status).toBe(200);
    expect(response.body.actor.type).toBe('CUSTOMER');
    expect(response.body.accessToken).toBe('token-login-customer');
  });

  it('deve retornar 401 para credenciais inválidas (caso de erro)', async () => {
    serviceMock.loginUser.mockRejectedValue(new UnauthorizedError('Credenciais inválidas'));

    const response = await request(app).post('/auth/users/login').send({
      email: 'admin@email.com',
      password: 'B8@qP4%rN1',
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Credenciais inválidas');
  });

  it('deve retornar dados do usuário autenticado (fluxo feliz)', async () => {
    serviceMock.getMe.mockResolvedValue({
      id: 'user-1',
      type: 'USER',
      name: 'Admin',
      email: 'admin@email.com',
      role: 'ADMIN',
    });

    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer token-123');

    expect(response.status).toBe(200);
    expect(response.body.id).toBe('user-1');
    expect(response.body.type).toBe('USER');
    expect(response.body.email).toBe('admin@email.com');
  });

  it('deve retornar dados do cliente autenticado (fluxo feliz)', async () => {
    serviceMock.getMe.mockResolvedValue({
      id: 'cust-1',
      type: 'CUSTOMER',
      name: 'Maria',
      phone: '+5585999999999',
    });

    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer token-456');

    expect(response.status).toBe(200);
    expect(response.body.id).toBe('cust-1');
    expect(response.body.type).toBe('CUSTOMER');
    expect(response.body.phone).toBe('+5585999999999');
  });

  it('deve retornar 401 quando não informar token (caso de erro)', async () => {
    const response = await request(app).get('/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.error).toContain('Token');
  });
