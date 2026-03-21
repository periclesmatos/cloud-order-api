import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../../src/modules/application/service/auth.service.js';
import { UnauthorizedError } from '../../../../src/modules/application/errors/unauthorized.error.js';
import { ValidationError } from '../../../../src/modules/domain/errors/validation.error.js';

describe('AuthService (unit)', () => {
  let userRepository;
  let customerRepository;
  let uuidGenerator;
  let passwordHasher;
  let tokenService;
  let service;

  beforeEach(() => {
    userRepository = {
      findByEmail: vi.fn(),
      saveUser: vi.fn(),
    };
    customerRepository = {
      findByPhone: vi.fn(),
    };
    uuidGenerator = {
      generate: vi.fn(() => 'user-1'),
    };
    passwordHasher = {
      hash: vi.fn(() => 'salt:hash'),
      compare: vi.fn(),
    };
    tokenService = {
      sign: vi.fn(() => 'token-123'),
    };

    service = new AuthService(userRepository, customerRepository, uuidGenerator, passwordHasher, tokenService);
  });

  it('deve registrar usuário admin e retornar token (fluxo feliz)', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.saveUser.mockImplementation(async (user) => user);

    const result = await service.registerUser({
      name: 'Admin',
      email: 'admin@email.com',
      password: 'SenhaForte123',
    });

    expect(result.user.id).toBe('user-1');
    expect(result.accessToken).toBe('token-123');
    expect(userRepository.saveUser).toHaveBeenCalledTimes(1);
  });

  it('deve autenticar usuário por e-mail e senha (fluxo feliz)', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      role: 'ADMIN',
      name: 'Admin',
      email: { toString: () => 'admin@email.com' },
      passwordHash: 'salt:hash',
    });
    passwordHasher.compare.mockReturnValue(true);

    const result = await service.loginUser({ email: 'admin@email.com', password: 'SenhaForte123' });

    expect(result.actor.type).toBe('USER');
    expect(result.accessToken).toBe('token-123');
  });

  it('deve autenticar cliente por telefone (fluxo feliz)', async () => {
    customerRepository.findByPhone.mockResolvedValue({
      id: 'cust-1',
      name: 'Maria',
      phone: { toString: () => '+5585999999999' },
    });

    const result = await service.loginCustomer({ phone: '85999999999' });

    expect(result.actor.type).toBe('CUSTOMER');
    expect(result.actor.id).toBe('cust-1');
  });

  it('deve falhar com credenciais inválidas para usuário (caso de erro)', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      passwordHash: 'salt:hash',
      role: 'ADMIN',
      name: 'Admin',
      email: { toString: () => 'admin@email.com' },
    });
    passwordHasher.compare.mockReturnValue(false);

    await expect(service.loginUser({ email: 'admin@email.com', password: 'errada' })).rejects.toThrow(UnauthorizedError);
  });

  it('deve falhar quando não informar telefone no login de cliente (caso de erro)', async () => {
    await expect(service.loginCustomer({})).rejects.toThrow(ValidationError);
  });
});
