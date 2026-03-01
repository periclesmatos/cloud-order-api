import { ValidationError } from '../errors/validation.error.js';

export class PostalCode {
  constructor(value) {
    if (value === undefined || value === null) {
      throw new ValidationError('CEP é obrigatório');
    }

    const rawValue = value instanceof PostalCode ? value.value : String(value).trim();
    this.value = PostalCode.normalize(rawValue);
    this.validate();
  }

  static normalize(value) {
    const digitsOnly = String(value).replace(/\D/g, '');
    if (digitsOnly.length !== 8) {
      return String(value).trim();
    }

    return `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5)}`;
  }

  validate() {
    const cepRegex = /^\d{5}-\d{3}$/;
    if (!cepRegex.test(this.value)) {
      throw new ValidationError('Formato de CEP inválido');
    }
  }

  toString() {
    return this.value;
  }
}
