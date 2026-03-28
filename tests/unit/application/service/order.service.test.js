import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderService } from '../../../../src/modules/application/service/order.service.js';
import { Order } from '../../../../src/modules/domain/entities/order.js';
import { Product } from '../../../../src/modules/domain/entities/product.js';
import { ValidationError } from '../../../../src/modules/domain/errors/validation.error.js';

describe('OrderService (unit)', () => {
  let orderRepository;
  let customerRepository;
  let productRepository;
  let uuidGenerator;
  let service;

  beforeEach(() => {
    orderRepository = {
      createOrder: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findByCustomerId: vi.fn(),
      findDetailedByCustomerId: vi.fn(),
      updateStatus: vi.fn(),
    };
    customerRepository = {
      findById: vi.fn(),
      findAddressById: vi.fn(),
    };
    productRepository = {
      findById: vi.fn(),
    };
    uuidGenerator = {
      generate: vi.fn(() => 'ord-1'),
    };

    service = new OrderService(orderRepository, customerRepository, productRepository, uuidGenerator);
  });

  it('deve criar pedido com baixa de estoque e itens consolidados (fluxo feliz)', async () => {
    customerRepository.findById.mockResolvedValue({ id: 'cust-1' });
    customerRepository.findAddressById.mockResolvedValue({
      id: 'addr-1',
      customerId: 'cust-1',
      street: 'Rua A',
      neighborhood: 'Centro',
      city: 'Fortaleza',
      state: 'CE',
      postalCode: '60000-000',
      complement: null,
      
    });
    const product = Product.create({
      id: 'prod-1',
      name: 'Mouse',
      price: 100,
      amount: 3,
    });
    productRepository.findById.mockResolvedValue(product);
    orderRepository.createOrder.mockResolvedValue(undefined);

    const order = await service.createOrder({
      customerId: 'cust-1',
      addressId: 'addr-1',
      items: [
        { productId: 'prod-1', quantity: 1 },
        { productId: 'prod-1', quantity: 2 },
      ],
    });

    expect(order.id).toBe('ord-1');
    expect(order.getTotalItems()).toBe(3);
    expect(orderRepository.createOrder).toHaveBeenCalledTimes(1);
    const [, stockUpdates] = orderRepository.createOrder.mock.calls[0];
    expect(stockUpdates[0].expectedAmount).toBe(3);
    expect(stockUpdates[0].product.amount).toBe(0);
  });

  it('deve falhar para cliente inexistente (caso de erro)', async () => {
    customerRepository.findById.mockResolvedValue(null);

    await expect(
      service.createOrder({
        customerId: 'cust-x',
        addressId: 'addr-1',
        items: [{ productId: 'prod-1', quantity: 1 }],
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('deve falhar para endereço inexistente (caso de erro)', async () => {
    customerRepository.findById.mockResolvedValue({ id: 'cust-1' });
    customerRepository.findAddressById.mockResolvedValue(null);

    await expect(
      service.createOrder({
        customerId: 'cust-1',
        addressId: 'addr-x',
        items: [{ productId: 'prod-1', quantity: 1 }],
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('deve falhar para produto inativo (caso de erro)', async () => {
    customerRepository.findById.mockResolvedValue({ id: 'cust-1' });
    customerRepository.findAddressById.mockResolvedValue({
      id: 'addr-1',
      customerId: 'cust-1',
      street: 'Rua A',
      neighborhood: 'Centro',
      city: 'Fortaleza',
      state: 'CE',
      postalCode: '60000-000',
      complement: null,
    });
    const product = Product.create({
      id: 'prod-1',
      name: 'Mouse',
      price: 100,
      amount: 3,
    });
    product.deactivate();
    productRepository.findById.mockResolvedValue(product);

    await expect(
      service.createOrder({
        customerId: 'cust-1',
        addressId: 'addr-1',
        items: [{ productId: 'prod-1', quantity: 1 }],
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('deve falhar para estoque insuficiente (caso de erro)', async () => {
    customerRepository.findById.mockResolvedValue({ id: 'cust-1' });
    customerRepository.findAddressById.mockResolvedValue({
      id: 'addr-1',
      customerId: 'cust-1',
      street: 'Rua A',
      neighborhood: 'Centro',
      city: 'Fortaleza',
      state: 'CE',
      postalCode: '60000-000',
      complement: null,
    });
    const product = Product.create({
      id: 'prod-1',
      name: 'Mouse',
      price: 100,
      amount: 1,
    });
    productRepository.findById.mockResolvedValue(product);

    await expect(
      service.createOrder({
        customerId: 'cust-1',
        addressId: 'addr-1',
        items: [{ productId: 'prod-1', quantity: 2 }],
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('deve listar pedidos por cliente quando filtro existir (fluxo feliz)', async () => {
    orderRepository.findByCustomerId.mockResolvedValue([{ id: 'ord-1' }]);
    const result = await service.listOrders({ customerId: 'cust-1' });
    expect(orderRepository.findByCustomerId).toHaveBeenCalledWith('cust-1', { customerId: 'cust-1' });
    expect(result).toHaveLength(1);
  });

  it('deve listar pedidos detalhados por cliente (fluxo feliz)', async () => {
    orderRepository.findDetailedByCustomerId.mockResolvedValue([{ id: 'ord-1', items: [{}] }]);
    const result = await service.listOrdersByCustomer('cust-1');
    expect(orderRepository.findDetailedByCustomerId).toHaveBeenCalledWith('cust-1', {});
    expect(result).toHaveLength(1);
  });

  it('deve atualizar status para SENT (fluxo feliz)', async () => {
    const order = Order.create({
      id: 'ord-1',
      customerId: 'cust-1',
      addressId: 'addr-1',
      deliveryAddress: {
        street: 'Rua A',
        neighborhood: 'Centro',
        city: 'Fortaleza',
        state: 'CE',
        postalCode: '60000-000',
        complement: null,
      },
      items: [{ productId: 'prod-1', productName: 'Mouse', quantity: 1, unitPrice: 100 }],
    });
    orderRepository.findById.mockResolvedValue(order);
    orderRepository.updateStatus.mockResolvedValue(order);

    const result = await service.updateOrderStatus('ord-1', 'SENT');

    expect(result.status).toBe('SENT');
    expect(orderRepository.updateStatus).toHaveBeenCalledWith(expect.any(Object), 'CREATED', []);
  });

  it('deve cancelar pedido e retornar estoque (fluxo feliz)', async () => {
    const order = Order.create({
      id: 'ord-1',
      customerId: 'cust-1',
      addressId: 'addr-1',
      deliveryAddress: {
        street: 'Rua A',
        neighborhood: 'Centro',
        city: 'Fortaleza',
        state: 'CE',
        postalCode: '60000-000',
        
        complement: null,
      },
      items: [{ productId: 'prod-1', productName: 'Mouse', quantity: 2, unitPrice: 100 }],
    });
    const product = Product.create({
      id: 'prod-1',
      name: 'Mouse',
      price: 100,
      amount: 1,
    });
    orderRepository.findById.mockResolvedValue(order);
    productRepository.findById.mockResolvedValue(product);
    orderRepository.updateStatus.mockResolvedValue(order);

    const result = await service.updateOrderStatus('ord-1', 'CANCELED');

    expect(result.status).toBe('CANCELED');
    const [, , stockUpdates] = orderRepository.updateStatus.mock.calls[0];
    expect(stockUpdates[0].expectedAmount).toBe(1);
    expect(stockUpdates[0].product.amount).toBe(3);
  });

  it('deve impedir cancelamento de pedido enviado (caso de erro)', async () => {
    const order = Order.create({
      id: 'ord-1',
      customerId: 'cust-1',
      addressId: 'addr-1',
      deliveryAddress: {
        street: 'Rua A',
        neighborhood: 'Centro',
        city: 'Fortaleza',
        state: 'CE',
        postalCode: '60000-000',
        
        complement: null,
      },
      items: [{ productId: 'prod-1', productName: 'Mouse', quantity: 1, unitPrice: 100 }],
    });
    order.updateStatus('SENT');
    orderRepository.findById.mockResolvedValue(order);

    await expect(service.updateOrderStatus('ord-1', 'CANCELED')).rejects.toThrow(ValidationError);
  });
});
