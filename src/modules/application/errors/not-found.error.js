import { ValidationError } from '../../domain/errors/validation.error.js';

export class NotFoundError extends ValidationError {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}
