import { ValidationError } from '../../domain/errors/validation.error.js';

export class ForbiddenError extends ValidationError {
  constructor(message = 'Acesso negado') {
    super(message);
    this.name = 'ForbiddenError';
  }
}
