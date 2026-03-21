import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../src/modules/infra/database/dynamodb/dynamo-client.js', () => ({
  TABLE_NAME: 'test-table',
  dynamodb: {
    send: vi.fn(),
  },
}));

import { dynamodb } from '../../../../../src/modules/infra/database/dynamodb/dynamo-client.js';
import { User } from '../../../../../src/modules/domain/entities/user.js';
import { ValidationError } from '../../../../../src/modules/domain/errors/validation.error.js';
import { UserDynamoDBRepository } from '../../../../../src/modules/infra/database/dynamodb/user.repository.js';

describe('UserDynamoDBRepository (unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve salvar usuário com lock de e-mail na transação (fluxo feliz)', async () => {
    const repository = new UserDynamoDBRepository();
    const user = User.create({
      id: 'user-1',
      name: 'Admin',
      email: 'admin@email.com',
      passwordHash: 'salt:hash',
      role: 'ADMIN',
    });

    dynamodb.send.mockResolvedValue({});
    await repository.saveUser(user);

    const input = dynamodb.send.mock.calls[0][0].input;
    expect(input.TransactItems).toHaveLength(2);
    expect(input.TransactItems[0].Put.Item.PK).toBe('USER#user-1');
    expect(input.TransactItems[1].Put.Item.PK).toBe('EMAIL#admin@email.com');
  });

  it('deve buscar usuário por e-mail usando lock e depois profile (fluxo feliz)', async () => {
    const repository = new UserDynamoDBRepository();

    dynamodb.send
      .mockResolvedValueOnce({ Items: [{ userId: 'user-1' }] })
      .mockResolvedValueOnce({
        Items: [
          {
            PK: 'USER#user-1',
            SK: 'PROFILE',
            userId: 'user-1',
            name: 'Admin',
            email: 'admin@email.com',
            passwordHash: 'salt:hash',
            role: 'ADMIN',
            isActive: true,
            createdAt: '2026-03-21T00:00:00.000Z',
            updatedAt: '2026-03-21T00:00:00.000Z',
          },
        ],
      });

    const user = await repository.findByEmail('admin@email.com');
    expect(user.id).toBe('user-1');
  });

  it('deve mapear conflito transacional ao salvar usuário (caso de erro)', async () => {
    const repository = new UserDynamoDBRepository();
    const user = User.create({
      id: 'user-1',
      name: 'Admin',
      email: 'admin@email.com',
      passwordHash: 'salt:hash',
      role: 'ADMIN',
    });

    dynamodb.send.mockRejectedValue({ name: 'TransactionCanceledException' });

    await expect(repository.saveUser(user)).rejects.toThrow(ValidationError);
  });
});
