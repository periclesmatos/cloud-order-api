import { ValidationError } from '../errors/validation.error.js';

export class Price {
  constructor(value) {
    if (value === undefined || value === null || value === '') {
      throw new ValidationError('Preco e obrigatorio');
    }

    const rawValue = value instanceof Price ? value.value : value;
    const numericValue = Number(rawValue);
    if (Number.isNaN(numericValue)) {
      throw new ValidationError('Preco deve ser numerico');
    }

    if (numericValue < 0) {
      throw new ValidationError('Preco nao pode ser negativo');
    }

    this.value = Number(numericValue.toFixed(2));
  }

  toNumber() {
    return this.value;
  }

  toString() {
    return this.value.toFixed(2);
  }

  valueOf() {
    return this.value;
  }

  toJSON() {
    return this.value;
  }
}
