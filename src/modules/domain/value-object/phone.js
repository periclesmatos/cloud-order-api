import { ValidationError } from '../errors/validation.error.js';
import { logger } from '../../shared/logger/console-logger.js';

export class Phone {
  constructor(value) {
    if (value === undefined || value === null) {
      throw new ValidationError('Telefone é obrigatório');
    }

    const sanitized = String(value).trim();
    this.value = sanitized.startsWith('+') ? sanitized : `+${sanitized}`;
    logger.debug('Phone', 'Normalized phone', { input: value, normalized: this.value });
    this.validate();
  }

  validate() {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
    if (!phoneRegex.test(this.value)) {
      throw new ValidationError('Formato de telefone inválido');
    }
  }

  toString() {
    return this.value;
  }
}
