import { ValidationError } from '../errors/validation.error.js';
import { Price } from '../value-object/price.js';

export class OrderItem {
  constructor({ productId, productName, quantity, unitPrice }) {
    if (!productId) throw new ValidationError('Produto do item é obrigatório');
    if (!productName) throw new ValidationError('Nome do produto do item é obrigatório');
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ValidationError('Quantidade do item deve ser inteiro positivo');
    }

    this.productId = productId;
    this.productName = productName;
    this.quantity = quantity;
    this.unitPrice = new Price(unitPrice);
  }

  getLineTotal() {
    return Number((this.unitPrice.toNumber() * this.quantity).toFixed(2));
  }
}
