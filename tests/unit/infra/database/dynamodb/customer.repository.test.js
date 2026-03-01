import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../src/modules/infra/database/dynamodb/dynamo-client.js', () => ({
  TABLE_NAME: 'test-table',
  dynamodb: {
    send: vi.fn(),
  },
}));

import { dynamodb } from '../../../../../src/modules/infra/database/dynamodb/dynamo-client.js';
import { Address } from '../../../../../src/modules/domain/entities/address.js';
import { Customer } from '../../../../../src/modules/domain/entities/customer.js';
import { CustomerDynamoDBRepository } from '../../../../../src/modules/infra/database/dynamodb/customer.repository.js';

describe('CustomerDynamoDBRepository (unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve agregar perfil e endereços ao buscar cliente por id (fluxo feliz)', async () => {
    const repository = new CustomerDynamoDBRepository();
    dynamodb.send.mockResolvedValueOnce({
      Items: [
        {
          PK: 'CUSTOMER#cust-1',
          SK: 'PROFILE',
          customerId: 'cust-1',
          name: 'Maria',
          email: 'maria@email.com',
          phone: '+5511999999999',
          createdAt: '2026-02-28T00:00:00.000Z',
        },
        {
          PK: 'CUSTOMER#cust-1',
          SK: 'ADDRESS#addr-1',
          addressId: 'addr-1',
          customerId: 'cust-1',
          street: 'Rua A',
          neighborhood: 'Centro',
          city: 'Fortaleza',
          state: 'CE',
          postalCode: '60000-000',
          country: 'BR',
          createdAt: '2026-02-28T00:00:00.000Z',
        },
        {
          PK: 'CUSTOMER#cust-1',
          SK: 'ADDRESS#addr-2',
          addressId: 'addr-2',
          customerId: 'cust-1',
          street: 'Rua B',
          neighborhood: 'Aldeota',
          city: 'Fortaleza',
          state: 'CE',
          postalCode: '60100-000',
          country: 'BR',
          createdAt: '2026-02-28T00:00:00.000Z',
        },
      ],
    });

    const customer = await repository.findById('cust-1');

    expect(customer.id).toBe('cust-1');
    expect(customer.addresses).toHaveLength(2);
  });

  it('deve montar exclusão em cascata com perfil, endereços e lock de telefone (fluxo feliz)', async () => {
    const repository = new CustomerDynamoDBRepository();
    dynamodb.send
      .mockResolvedValueOnce({
        Items: [
          {
            PK: 'CUSTOMER#cust-1',
            SK: 'PROFILE',
            phone: '+5511999999999',
            customerId: 'cust-1',
          },
          {
            PK: 'CUSTOMER#cust-1',
            SK: 'ADDRESS#addr-1',
          },
          {
            PK: 'CUSTOMER#cust-1',
            SK: 'ADDRESS#addr-2',
          },
        ],
      })
      .mockResolvedValueOnce({});

    await repository.deleteCustomerCascade('cust-1');

    expect(dynamodb.send).toHaveBeenCalledTimes(2);
    const transactInput = dynamodb.send.mock.calls[1][0].input;
    expect(transactInput.TransactItems).toHaveLength(4);
    expect(transactInput.TransactItems.some((item) => item.Delete?.Key?.SK === 'PROFILE')).toBe(true);
    expect(transactInput.TransactItems.some((item) => item.Delete?.Key?.SK === 'ADDRESS#addr-1')).toBe(true);
    expect(transactInput.TransactItems.some((item) => item.Delete?.Key?.SK === 'LOCK')).toBe(true);
  });

  it('deve retornar nulo ao buscar por telefone quando lock não existe (caso de borda)', async () => {
    const repository = new CustomerDynamoDBRepository();
    dynamodb.send.mockResolvedValueOnce({ Items: [] });

    const customer = await repository.findByPhone('+5511999999999');

    expect(customer).toBeNull();
  });

  it('deve resolver cliente por telefone usando customerId do lock (fluxo feliz)', async () => {
    const repository = new CustomerDynamoDBRepository();
    dynamodb.send
      .mockResolvedValueOnce({ Items: [{ customerId: 'cust-1' }] })
      .mockResolvedValueOnce({
        Items: [
          {
            PK: 'CUSTOMER#cust-1',
            SK: 'PROFILE',
            customerId: 'cust-1',
            name: 'Maria',
            email: 'maria@email.com',
            phone: '+5511999999999',
            createdAt: '2026-02-28T00:00:00.000Z',
          },
        ],
      });

    const customer = await repository.findByPhone('+5511999999999');

    expect(customer.id).toBe('cust-1');
  });

  it('deve usar chaves corretas para salvar, atualizar e excluir endereço (fluxo feliz)', async () => {
    const repository = new CustomerDynamoDBRepository();
    const address = Address.create({
      id: 'addr-1',
      customerId: 'cust-1',
      street: 'Rua A',
      neighborhood: 'Centro',
      city: 'Fortaleza',
      state: 'CE',
      postalCode: '60000-000',
      country: 'BR',
    });

    const customer = Customer.create({
      id: 'cust-1',
      name: 'Maria',
      email: 'maria@email.com',
      phone: '+5511999999999',
    });

    dynamodb.send.mockResolvedValue({});

    await repository.saveAddress(address);
    await repository.updateAddress(address);
    await repository.deleteAddress('cust-1', 'addr-1');
    await repository.saveCustomer(customer);

    const saveAddressInput = dynamodb.send.mock.calls[0][0].input;
    const updateAddressInput = dynamodb.send.mock.calls[1][0].input;
    const deleteAddressInput = dynamodb.send.mock.calls[2][0].input;
    const saveCustomerInput = dynamodb.send.mock.calls[3][0].input;

    expect(saveAddressInput.TransactItems[1].Put.Item.SK).toBe('ADDRESS#addr-1');
    expect(updateAddressInput.TransactItems[0].Put.Item.SK).toBe('ADDRESS#addr-1');
    expect(deleteAddressInput.TransactItems[0].Delete.Key.SK).toBe('ADDRESS#addr-1');
    expect(saveCustomerInput.TransactItems[1].Put.Item.PK).toBe('PHONE#+5511999999999');
  });

  it('deve atualizar lock de telefone quando o telefone do cliente muda (fluxo feliz)', async () => {
    const repository = new CustomerDynamoDBRepository();
    const customer = Customer.create({
      id: 'cust-1',
      name: 'Maria',
      email: 'maria@email.com',
      phone: '+5511888888888',
    });

    dynamodb.send.mockResolvedValue({});

    await repository.update(customer, '+5511999999999');

    const updateInput = dynamodb.send.mock.calls[0][0].input;
    expect(updateInput.TransactItems).toHaveLength(3);
    expect(updateInput.TransactItems[1].Delete.Key.PK).toBe('PHONE#+5511999999999');
    expect(updateInput.TransactItems[2].Put.Item.PK).toBe('PHONE#+5511888888888');
  });

  it('deve atualizar cliente sem mexer em lock quando telefone não muda (caso de borda)', async () => {
    const repository = new CustomerDynamoDBRepository();
    const customer = Customer.create({
      id: 'cust-1',
      name: 'Maria',
      email: 'maria@email.com',
      phone: '+5511999999999',
    });
    dynamodb.send.mockResolvedValue({});

    await repository.update(customer, '+5511999999999');

    const updateInput = dynamodb.send.mock.calls[0][0].input;
    expect(updateInput.TransactItems).toHaveLength(1);
  });

  it('deve mapear TransactionCanceledException em operações críticas (caso de erro)', async () => {
    const repository = new CustomerDynamoDBRepository();
    const transactionError = { name: 'TransactionCanceledException' };

    const customer = Customer.create({
      id: 'cust-1',
      name: 'Maria',
      email: 'maria@email.com',
      phone: '+5511999999999',
    });
    const address = Address.create({
      id: 'addr-1',
      customerId: 'cust-1',
      street: 'Rua A',
      neighborhood: 'Centro',
      city: 'Fortaleza',
      state: 'CE',
      postalCode: '60000-000',
      country: 'BR',
    });

    dynamodb.send.mockRejectedValueOnce(transactionError);
    await expect(repository.saveCustomer(customer)).rejects.toThrow();

    dynamodb.send.mockRejectedValueOnce(transactionError);
    await expect(repository.update(customer, '+5511888888888')).rejects.toThrow();

    dynamodb.send.mockRejectedValueOnce(transactionError);
    await expect(repository.saveAddress(address)).rejects.toThrow();

    dynamodb.send.mockRejectedValueOnce(transactionError);
    await expect(repository.updateAddress(address)).rejects.toThrow();

    dynamodb.send.mockRejectedValueOnce(transactionError);
    await expect(repository.deleteAddress('cust-1', 'addr-1')).rejects.toThrow();
  });

  it('deve falhar ao excluir em cascata quando perfil do cliente não existe (caso de erro)', async () => {
    const repository = new CustomerDynamoDBRepository();
    dynamodb.send.mockResolvedValueOnce({ Items: [] });

    await expect(repository.deleteCustomerCascade('cust-1')).rejects.toThrow();
  });

  it('deve dividir transações de exclusão em cascata quando houver mais de 25 itens (caso de borda)', async () => {
    const repository = new CustomerDynamoDBRepository();
    const items = [
      {
        PK: 'CUSTOMER#cust-1',
        SK: 'PROFILE',
        phone: '+5511999999999',
      },
    ];
    for (let i = 0; i < 30; i++) {
      items.push({ PK: 'CUSTOMER#cust-1', SK: `ADDRESS#addr-${i}` });
    }

    dynamodb.send
      .mockResolvedValueOnce({ Items: items })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    await repository.deleteCustomerCascade('cust-1');

    expect(dynamodb.send).toHaveBeenCalledTimes(3);
  });

  it('deve retornar lista de clientes em findAll (fluxo feliz)', async () => {
    const repository = new CustomerDynamoDBRepository();
    dynamodb.send.mockResolvedValueOnce({
      Items: [
        {
          customerId: 'cust-1',
          name: 'Maria',
          email: 'maria@email.com',
          phone: '+5511999999999',
          createdAt: '2026-02-28T00:00:00.000Z',
        },
      ],
    });

    const customers = await repository.findAll();
    expect(customers).toHaveLength(1);
  });
});
