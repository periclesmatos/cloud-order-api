import { ValidationError } from '../errors/validation.error.js';
import { OrderItem } from './order-item.js';

export class Order {
  static ALLOWED_STATUS = ['CREATED', 'SENT', 'COMPLETED', 'CANCELED'];

  constructor({ id, customerId, addressId, deliveryAddress, items, status, createdAt, updatedAt }) {
    if (!id) throw new ValidationError('ID do pedido é obrigatório');
    if (!customerId) throw new ValidationError('Cliente do pedido é obrigatório');
    if (!addressId) throw new ValidationError('Endereço do pedido é obrigatório');
    if (!deliveryAddress?.street || !deliveryAddress?.city || !deliveryAddress?.state || !deliveryAddress?.postalCode) {
      throw new ValidationError('Snapshot do endereço de entrega é obrigatório');
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new ValidationError('Pedido deve possuir ao menos um item');
    }

    this.id = id;
    this.customerId = customerId;
    this.addressId = addressId;
    this.deliveryAddress = deliveryAddress;
    this.items = items.map((item) => (item instanceof OrderItem ? item : new OrderItem(item)));
    this.status = status ?? 'CREATED';
    if (!Order.ALLOWED_STATUS.includes(this.status)) {
      throw new ValidationError('Status do pedido inválido');
    }
    this.createdAt = createdAt ?? new Date().toISOString();
    this.updatedAt = updatedAt ?? this.createdAt;
  }

  static create({ id, customerId, addressId, deliveryAddress, items }) {
    return new Order({ id, customerId, addressId, deliveryAddress, items, status: 'CREATED' });
  }

  getTotalAmount() {
    return Number(this.items.reduce((sum, item) => sum + item.getLineTotal(), 0).toFixed(2));
  }

  getTotalItems() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  updateStatus(nextStatus) {
    if (!Order.ALLOWED_STATUS.includes(nextStatus)) {
      throw new ValidationError('Status do pedido inválido');
    }

    if (this.status === nextStatus) return;

    const transitions = {
      CREATED: ['SENT', 'CANCELED'],
      SENT: ['COMPLETED'],
      COMPLETED: [],
      CANCELED: [],
    };

    const allowedNext = transitions[this.status] ?? [];
    if (!allowedNext.includes(nextStatus)) {
      throw new ValidationError(`Não é permitido alterar pedido de ${this.status} para ${nextStatus}`);
    }

    this.status = nextStatus;
    this.updatedAt = new Date().toISOString();
  }
}
