import { ValidationError } from '../errors/validation.error.js';
import { Price } from '../value-object/price.js';

export class Product {
  constructor({ id, name, price, amount, isActive, createdAt, updatedAt }) {
    this.id = id;
    this.name = name;
    this.price = new Price(price);
    this.amount = amount;
    this.isActive = isActive ?? true;
    this.createdAt = createdAt ?? new Date().toISOString();
    this.updatedAt = updatedAt ?? new Date().toISOString();
  }

  static create({ id, name, price, amount, createdAt }) {
    if (!name) throw new ValidationError('Nome é obrigatório');
    if (price == null) throw new ValidationError('Preço é obrigatório');
    if (amount == null) throw new ValidationError('Quantidade é obrigatória');

    return new Product({ id, name, price, amount, createdAt });
  }

  changeName(newName) {
    if (!newName) throw new ValidationError('Nome é obrigatório');
    this.name = newName;
    this.updatedAt = new Date().toISOString();
  }

  changePrice(newPrice) {
    this.price = new Price(newPrice);
    this.updatedAt = new Date().toISOString();
  }

  changeAmount(newAmount) {
    if (newAmount <= 0) throw new ValidationError('Quantidade não pode ser negativa');
    this.amount = newAmount;
    this.updatedAt = new Date().toISOString();
  }

  activate() {
    this.isActive = true;
    this.updatedAt = new Date().toISOString();
  }

  deactivate() {
    this.isActive = false;
    this.updatedAt = new Date().toISOString();
  }
}
