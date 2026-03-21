import { describe, expect, it } from 'vitest';
import { User } from '../../../../src/modules/domain/entities/user.js';
import { ValidationError } from '../../../../src/modules/domain/errors/validation.error.js';

describe('User (unit)', () => {
  it('deve criar usuário com role admin por padrão (fluxo feliz)', () => {
    const user = User.create({
      id: 'user-1',
      name: 'Admin',
      email: 'admin@email.com',
      passwordHash: 'salt:hash',
    });

    expect(user.role).toBe('ADMIN');
    expect(user.isActive).toBe(true);
  });

  it('deve falhar quando passwordHash não for informado (caso de erro)', () => {
    expect(() =>
      User.create({
        id: 'user-1',
        name: 'Admin',
        email: 'admin@email.com',
      }),
    ).toThrow(ValidationError);
  });

  it('deve falhar quando nome for somente espaços (caso de erro)', () => {
    expect(() =>
      User.create({
        id: 'user-1',
        name: '   ',
        email: 'admin@email.com',
        passwordHash: 'salt:hash',
      }),
    ).toThrow(ValidationError);
  });
});
