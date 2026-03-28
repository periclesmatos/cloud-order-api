import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CustomerService } from '../../../../src/modules/application/service/customer.service.js';
import { Customer } from '../../../../src/modules/domain/entities/customer.js';
import { ValidationError } from '../../../../src/modules/domain/errors/validation.error.js';

describe('CustomerService (unit)', () => {
  let repository;
  let uuidGenerator;
  let service;

  beforeEach(() => {
    repository = {
      findByPhone: vi.fn(),
      saveCustomer: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      saveAddress: vi.fn(),
      findAddressById: vi.fn(),
      updateAddress: vi.fn(),
      deleteAddress: vi.fn(),
      deleteCustomerCascade: vi.fn(),
    };

    uuidGenerator = {
      generate: vi.fn(() => 'cust-123'),
    };

    service = new CustomerService(repository, uuidGenerator);
  });

  it('deve criar cliente com telefone normalizado quando dados são válidos (fluxo feliz)', async () => {
    // Arrange
    repository.findByPhone.mockResolvedValue(null);
    repository.saveCustomer.mockImplementation(async (customer) => customer);

    // Act
    const resultado = await service.createCustomer({
      name: 'Maria',
      email: 'maria@email.com',
      phone: '5511999999999',
    });

    // Assert
    expect(repository.findByPhone).toHaveBeenCalledWith('+5511999999999');
    expect(repository.saveCustomer).toHaveBeenCalledTimes(1);
    expect(resultado.phone.toString()).toBe('+5511999999999');
  });

  it('deve falhar ao criar cliente quando telefone já existe (caso de erro)', async () => {
    // Arrange
    repository.findByPhone.mockResolvedValue({ id: 'cust-existente' });

    // Act + Assert
    await expect(
      service.createCustomer({
        name: 'Maria',
        email: 'maria@email.com',
        phone: '+5511999999999',
      }),
    ).rejects.toThrow(ValidationError);
    expect(repository.saveCustomer).not.toHaveBeenCalled();
  });

  it('deve buscar cliente por id (fluxo feliz)', async () => {
    // Arrange
    repository.findById.mockResolvedValue({ id: 'cust-1' });

    // Act
    const resultado = await service.getCustomerById('cust-1');

    // Assert
    expect(repository.findById).toHaveBeenCalledWith('cust-1');
    expect(resultado).toEqual({ id: 'cust-1' });
  });

  it('deve normalizar telefone ao buscar cliente por telefone (caso de borda)', async () => {
    // Arrange
    repository.findByPhone.mockResolvedValue(null);

    // Act
    await service.getCustomerByPhone('5511888888888');

    // Assert
    expect(repository.findByPhone).toHaveBeenCalledWith('+5511888888888');
  });

  it('deve listar clientes (fluxo feliz)', async () => {
    // Arrange
    repository.findAll.mockResolvedValue([{ id: 'cust-1' }, { id: 'cust-2' }]);

    // Act
    const resultado = await service.listCustomers();

    // Assert
    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(resultado).toHaveLength(2);
  });

  it('deve atualizar cliente e enviar telefone anterior para o repositório (fluxo feliz)', async () => {
    // Arrange
    const customer = Customer.create({
      id: 'cust-1',
      name: 'Maria',
      email: 'maria@email.com',
      phone: '+5511999999999',
    });
    repository.findById.mockResolvedValue(customer);
    repository.findByPhone.mockResolvedValue(null);
    repository.update.mockResolvedValue(customer);

    // Act
    await service.updateCustomer('cust-1', { phone: '+5511888888888' });

    // Assert
    expect(repository.update).toHaveBeenCalledWith(expect.any(Object), '+5511999999999');
  });

  it('deve falhar ao atualizar cliente inexistente (caso de erro)', async () => {
    // Arrange
    repository.findById.mockResolvedValue(null);

    // Act + Assert
    await expect(service.updateCustomer('cust-1', { name: 'Novo Nome' })).rejects.toThrow(ValidationError);
  });

  it('deve falhar ao atualizar quando novo telefone pertence a outro cliente (caso de erro)', async () => {
    // Arrange
    const customer = Customer.create({
      id: 'cust-1',
      name: 'Maria',
      email: 'maria@email.com',
      phone: '+5511999999999',
    });
    repository.findById.mockResolvedValue(customer);
    repository.findByPhone.mockResolvedValue({ id: 'cust-2' });

    // Act + Assert
    await expect(service.updateCustomer('cust-1', { phone: '+5511888888888' })).rejects.toThrow(ValidationError);
  });

  it('deve excluir cliente em cascata quando cliente existe (fluxo feliz)', async () => {
    // Arrange
    repository.findById.mockResolvedValue({ id: 'cust-1' });

    // Act
    await service.deleteCustomer('cust-1');

    // Assert
    expect(repository.deleteCustomerCascade).toHaveBeenCalledWith('cust-1');
  });

  it('deve falhar ao excluir cliente inexistente (caso de erro)', async () => {
    // Arrange
    repository.findById.mockResolvedValue(null);

    // Act + Assert
    await expect(service.deleteCustomer('cust-1')).rejects.toThrow(ValidationError);
  });

  it('deve criar endereço para cliente existente (fluxo feliz)', async () => {
    // Arrange
    uuidGenerator.generate.mockReturnValueOnce('addr-1');
    repository.findById.mockResolvedValue({ id: 'cust-1' });
    repository.saveAddress.mockImplementation(async (address) => address);

    // Act
    const resultado = await service.createAddress('cust-1', {
      street: 'Rua A',
      neighborhood: 'Centro',
      city: 'Fortaleza',
      state: 'CE',
      postalCode: '60000-000',
      complement: 'Apto 1',
    });

    // Assert
    expect(repository.saveAddress).toHaveBeenCalledTimes(1);
    expect(resultado.id).toBe('addr-1');
  });

  it('deve falhar ao criar endereço para cliente inexistente (caso de erro)', async () => {
    // Arrange
    repository.findById.mockResolvedValue(null);

    // Act + Assert
    await expect(
      service.createAddress('cust-1', {
        street: 'Rua A',
        neighborhood: 'Centro',
        city: 'Fortaleza',
        state: 'CE',
        postalCode: '60000-000',
        complement: 'Apto 1',
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('deve atualizar endereço existente preservando campos não informados (caso de borda)', async () => {
    // Arrange
    repository.findById.mockResolvedValue({ id: 'cust-1' });
    repository.findAddressById.mockResolvedValue({
      id: 'addr-1',
      customerId: 'cust-1',
      street: 'Rua A',
      neighborhood: 'Centro',
      city: 'Fortaleza',
      state: 'CE',
      postalCode: '60000-000',
      complement: 'Casa',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    repository.updateAddress.mockImplementation(async (address) => address);

    // Act
    const resultado = await service.updateAddress('cust-1', 'addr-1', { city: 'Recife' });

    // Assert
    expect(resultado.city).toBe('Recife');
    expect(resultado.street).toBe('Rua A');
  });

  it('deve falhar ao atualizar endereço quando cliente não existe (caso de erro)', async () => {
    // Arrange
    repository.findById.mockResolvedValue(null);

    // Act + Assert
    await expect(service.updateAddress('cust-1', 'addr-1', { city: 'Recife' })).rejects.toThrow(ValidationError);
  });

  it('deve falhar ao atualizar endereço inexistente (caso de erro)', async () => {
    // Arrange
    repository.findById.mockResolvedValue({ id: 'cust-1' });
    repository.findAddressById.mockResolvedValue(null);

    // Act + Assert
    await expect(service.updateAddress('cust-1', 'addr-1', { street: 'Rua B' })).rejects.toThrow(ValidationError);
  });

  it('deve excluir endereço quando cliente e endereço existem (fluxo feliz)', async () => {
    // Arrange
    repository.findById.mockResolvedValue({ id: 'cust-1' });
    repository.findAddressById.mockResolvedValue({ id: 'addr-1', customerId: 'cust-1' });

    // Act
    await service.deleteAddress('cust-1', 'addr-1');

    // Assert
    expect(repository.deleteAddress).toHaveBeenCalledWith('cust-1', 'addr-1');
  });

  it('deve falhar ao excluir endereço quando cliente não existe (caso de erro)', async () => {
    // Arrange
    repository.findById.mockResolvedValue(null);

    // Act + Assert
    await expect(service.deleteAddress('cust-1', 'addr-1')).rejects.toThrow(ValidationError);
  });

  it('deve falhar ao excluir endereço inexistente (caso de erro)', async () => {
    // Arrange
    repository.findById.mockResolvedValue({ id: 'cust-1' });
    repository.findAddressById.mockResolvedValue(null);

    // Act + Assert
    await expect(service.deleteAddress('cust-1', 'addr-1')).rejects.toThrow(ValidationError);
  });
});
