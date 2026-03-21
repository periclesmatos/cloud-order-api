import { ValidationError } from '../../domain/errors/validation.error.js';

export class UnauthorizedError extends ValidationError {
  constructor(message = 'Não autenticado') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
