import { describe, expect, it } from 'vitest';
import { Address } from '../../../../../src/modules/domain/entities/address.js';
import { Customer } from '../../../../../src/modules/domain/entities/customer.js';
import {
  toCustomerAddressItem,
  toCustomerItem,
  toDomainAddress,
  toDomainCustomer,
  toPhoneLockItem,
} from '../../../../../src/modules/infra/database/dynamodb/mappers/customer.mapper.js';

describe('CustomerMapper (unit)', () => {
  it('deve mapear cliente de domínio para item do DynamoDB (fluxo feliz)', () => {
    // Arrange
    const customer = Customer.create({
      id: 'cust-1',
      name: 'Maria',
      email: 'maria@email.com',
      phone: '+5511999999999',
    });

    // Act
    const item = toCustomerItem(customer);

    // Assert
    expect(item.PK).toBe('CUSTOMER#cust-1');
    expect(item.SK).toBe('PROFILE');
    expect(item.customerId).toBe('cust-1');
    expect(item.phone).toBe('+5511999999999');
  });

  it('deve mapear lock de telefone para item do DynamoDB (fluxo feliz)', () => {
    // Arrange
    const customer = Customer.create({
      id: 'cust-1',
      name: 'Maria',
      email: 'maria@email.com',
      phone: '+5511999999999',
    });

    // Act
    const item = toPhoneLockItem(customer);

    // Assert
    expect(item.PK).toBe('PHONE#+5511999999999');
    expect(item.SK).toBe('LOCK');
    expect(item.customerId).toBe('cust-1');
    expect(item.createdAt).toBeTypeOf('string');
  });

  it('deve mapear item do DynamoDB para cliente de domínio (fluxo feliz)', () => {
    // Arrange
    const item = {
      customerId: 'cust-2',
      name: 'Joao',
      email: 'joao@email.com',
      phone: '+5585999999999',
      createdAt: '2026-02-28T00:00:00.000Z',
    };

    // Act
    const customer = toDomainCustomer(item);

    // Assert
    expect(customer.id).toBe('cust-2');
    expect(customer.name).toBe('Joao');
    expect(customer.email.toString()).toBe('joao@email.com');
    expect(customer.phone.toString()).toBe('+5585999999999');
    expect(customer.createdAt).toBe('2026-02-28T00:00:00.000Z');
  });

  it('deve mapear endereço de domínio para item do DynamoDB (fluxo feliz)', () => {
    // Arrange
    const address = Address.create({
      id: 'addr-1',
      customerId: 'cust-2',
      street: 'Rua A',
      neighborhood: 'Centro',
      city: 'Fortaleza',
      state: 'CE',
      postalCode: '60000-000',
      complement: 'Apto 1',
    });

    // Act
    const item = toCustomerAddressItem(address);

    // Assert
    expect(item.PK).toBe('CUSTOMER#cust-2');
    expect(item.SK).toBe('ADDRESS#addr-1');
    expect(item.type).toBe('CUSTOMER_ADDRESS');
    expect(item.customerId).toBe('cust-2');
  });

  it('deve mapear item do DynamoDB para endereço de domínio (fluxo feliz)', () => {
    // Arrange
    const item = {
      addressId: 'addr-2',
      customerId: 'cust-3',
      street: 'Rua B',
      neighborhood: 'Aldeota',
      city: 'Fortaleza',
      state: 'CE',
      postalCode: '60100-000',
      complement: 'Casa',
      createdAt: '2026-02-28T00:00:00.000Z',
    };

    // Act
    const address = toDomainAddress(item);

    // Assert
    expect(address.id).toBe('addr-2');
    expect(address.customerId).toBe('cust-3');
    expect(address.city).toBe('Fortaleza');
    expect(address.createdAt).toBe('2026-02-28T00:00:00.000Z');
  });

  it('deve retornar nulo quando item de entrada for nulo (caso de borda)', () => {
    // Arrange + Act + Assert
    expect(toDomainCustomer(null)).toBeNull();
    expect(toDomainAddress(null)).toBeNull();
  });

  it('deve mapear endereço usando campo id alternativo (caso de borda)', () => {
    // Arrange
    const item = {
      id: 'addr-9',
      customerId: 'cust-9',
      street: 'Rua X',
      neighborhood: 'Centro',
      city: 'Fortaleza',
      state: 'CE',
      postalCode: '60000-000',
      createdAt: '2026-02-28T00:00:00.000Z',
    };

    // Act
    const address = toDomainAddress(item);

    // Assert
    expect(address.id).toBe('addr-9');
  });
});
