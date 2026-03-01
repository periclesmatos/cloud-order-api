import { ValidationError } from '../errors/validation.error.js';

export class Email {
  constructor(value) {
    if (value === undefined || value === null) {
      throw new ValidationError('E-mail é obrigatório');
    }

    this.value = String(value).trim().toLowerCase();
    this.validate();
  }

  validate() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.value)) {
      throw new ValidationError('Formato de e-mail inválido');
    }
  }

  toString() {
    return this.value;
  }
}
