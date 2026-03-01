import { ValidationError } from '../errors/validation.error.js';
import { Email } from '../value-object/email.js';
import { Phone } from '../value-object/phone.js';

export class Customer {
  constructor({ id, name, email, phone, createdAt, addresses }) {
    this.id = id;
    this.name = name;
    this.email = new Email(email);
    this.phone = new Phone(phone);
    this.createdAt = createdAt ?? new Date().toISOString();
    this.addresses = addresses ?? [];
  }

  static create({ id, name, email, phone, createdAt, addresses = [] }) {
    if (!name) throw new ValidationError('Nome é obrigatório');
    if (!email) throw new ValidationError('Email é obrigatório');
    if (!phone) throw new ValidationError('Telefone é obrigatório');

    return new Customer({ id, name, email, phone, createdAt, addresses });
  }

  changeName(newName) {
    this.name = newName;
  }

  changeEmail(newEmail) {
    this.email = new Email(newEmail);
  }

  changePhone(newPhone) {
    this.phone = new Phone(newPhone);
  }

  setAddresses(addresses) {
    this.addresses = addresses ?? [];
  }
}
