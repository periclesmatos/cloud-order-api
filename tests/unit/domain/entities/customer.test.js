import { describe, expect, it } from 'vitest';
import { Customer } from '../../../../src/modules/domain/entities/customer.js';
import { ValidationError } from '../../../../src/modules/domain/errors/validation.error.js';

describe('Customer', () => {
  it('deve alterar nome, e-mail e telefone do cliente (fluxo feliz)', () => {
    // Arrange
    const customer = Customer.create({
      id: 'cust-1',
      name: 'Maria',
      email: 'maria@email.com',
      phone: '+5511999999999',
    });

    // Act
    customer.changeName('Maria Silva');
    customer.changeEmail('maria.silva@email.com');
    customer.changePhone('5511888888888');

    // Assert
    expect(customer.name).toBe('Maria Silva');
    expect(customer.email.toString()).toBe('maria.silva@email.com');
    expect(customer.phone.toString()).toBe('+5511888888888');
  });

  it('deve definir lista de endereços no cliente (fluxo feliz)', () => {
    // Arrange
    const customer = Customer.create({
      id: 'cust-1',
      name: 'Maria',
      email: 'maria@email.com',
      phone: '+5511999999999',
    });

    // Act
    customer.setAddresses([{ id: 'addr-1' }]);

    // Assert
    expect(customer.addresses).toHaveLength(1);
  });

  it('deve falhar ao criar cliente sem campos obrigatórios (caso de erro)', () => {
    // Arrange + Act + Assert
    expect(() => Customer.create({ id: 'cust-1', email: 'maria@email.com', phone: '+5511999999999' })).toThrow(
      ValidationError,
    );
    expect(() => Customer.create({ id: 'cust-1', name: 'Maria', phone: '+5511999999999' })).toThrow(ValidationError);
    expect(() => Customer.create({ id: 'cust-1', name: 'Maria', email: 'maria@email.com' })).toThrow(ValidationError);
  });
});
