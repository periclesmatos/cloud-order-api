import { Order } from '../../domain/entities/order.js';
import { NotFoundError } from '../errors/not-found.error.js';
import { ValidationError } from '../../domain/errors/validation.error.js';

export class OrderService {
  constructor(orderRepository, customerRepository, productRepository, uuidGenerator) {
    this.orderRepository = orderRepository;
    this.customerRepository = customerRepository;
    this.productRepository = productRepository;
    this.uuidGenerator = uuidGenerator;
  }

  normalizeItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new ValidationError('Pedido deve possuir ao menos um item');
    }

    const grouped = new Map();
    for (const item of items) {
      if (!item?.productId) throw new ValidationError('productId é obrigatório');
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new ValidationError('quantity deve ser inteiro positivo');
      }

      const current = grouped.get(item.productId) ?? 0;
      grouped.set(item.productId, current + quantity);
    }

    if (grouped.size > 10) {
      throw new ValidationError('Pedido suporta no máximo 10 produtos distintos');
    }

    return Array.from(grouped.entries()).map(([productId, quantity]) => ({ productId, quantity }));
  }

  async createOrder(orderData) {
    const { customerId, addressId, items } = orderData ?? {};
    if (!customerId) throw new ValidationError('customerId é obrigatório');
    if (!addressId) throw new ValidationError('addressId é obrigatório');

    const customer = await this.customerRepository.findById(customerId);
    if (!customer) throw new NotFoundError('Cliente não encontrado');
    const address = await this.customerRepository.findAddressById(customerId, addressId);
    if (!address) throw new NotFoundError('Endereço não encontrado');

    const normalizedItems = this.normalizeItems(items);
    const products = await Promise.all(
      normalizedItems.map(({ productId }) => this.productRepository.findById(productId)),
    );

    const orderItems = [];
    const stockUpdates = [];

    normalizedItems.forEach(({ productId, quantity }, index) => {
      const product = products[index];
      if (!product) throw new NotFoundError(`Produto não encontrado: ${productId}`);
      if (!product.isActive) throw new ValidationError(`Produto inativo: ${product.name}`);
      if (product.amount < quantity) {
        throw new ValidationError(`Estoque insuficiente para o produto: ${product.name}`);
      }

      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.price.toNumber(),
      });

      const expectedAmount = product.amount;
      const expectedUpdatedAt = product.updatedAt;
      product.changeAmount(product.amount - quantity);
      stockUpdates.push({
        product,
        expectedAmount,
        expectedUpdatedAt,
      });
    });

    const order = Order.create({
      id: this.uuidGenerator.generate(),
      customerId,
      addressId,
      deliveryAddress: {
        street: address.street,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        postalCode:
          typeof address.postalCode === 'string' ? address.postalCode : address.postalCode.toString(),
        country: address.country,
        complement: address.complement ?? null,
      },
      items: orderItems,
    });

    await this.orderRepository.createOrder(order, stockUpdates);
    return order;
  }

  async getOrderById(orderId) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Pedido não encontrado');
    return order;
  }

  async listOrders(filters = {}) {
    if (filters.customerId) {
      return this.orderRepository.findByCustomerId(filters.customerId, filters);
    }
    return this.orderRepository.findAll(filters);
  }

  async listOrdersByCustomer(customerId, filters = {}) {
    if (!customerId) throw new ValidationError('customerId é obrigatório');
    return this.orderRepository.findDetailedByCustomerId(customerId, filters);
  }

  async updateOrderStatus(orderId, nextStatus) {
    if (!nextStatus) throw new ValidationError('status é obrigatório');

    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Pedido não encontrado');

    const previousStatus = order.status;
    if (previousStatus === nextStatus) {
      return order;
    }

    if (nextStatus === 'CANCELED' && (previousStatus === 'SENT' || previousStatus === 'COMPLETED')) {
      throw new ValidationError('Pedido enviado ou concluído não pode ser cancelado');
    }

    order.updateStatus(nextStatus);

    const stockUpdates = [];
    if (nextStatus === 'CANCELED') {
      const products = await Promise.all(
        order.items.map((item) => this.productRepository.findById(item.productId)),
      );

      order.items.forEach((item, index) => {
        const product = products[index];
        if (!product) {
          throw new NotFoundError(`Produto do pedido não encontrado para estorno: ${item.productId}`);
        }

        const expectedAmount = product.amount;
        const expectedUpdatedAt = product.updatedAt;
        product.changeAmount(product.amount + item.quantity);
        stockUpdates.push({
          product,
          expectedAmount,
          expectedUpdatedAt,
        });
      });
    }

    await this.orderRepository.updateStatus(order, previousStatus, stockUpdates);
    return order;
  }
}
