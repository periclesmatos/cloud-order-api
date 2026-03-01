import { describe, expect, it } from 'vitest';
import { Email } from '../../../../src/modules/domain/value-object/email.js';
import { ValidationError } from '../../../../src/modules/domain/errors/validation.error.js';

describe('Email', () => {
  it('deve normalizar e-mail para minúsculas (fluxo feliz)', () => {
    // Arrange
    const email = new Email('  TESTE@EMAIL.COM ');

    // Act
    const resultado = email.toString();

    // Assert
    expect(resultado).toBe('teste@email.com');
  });

  it('deve falhar quando e-mail não for informado (caso de erro)', () => {
    // Arrange + Act + Assert
    expect(() => new Email(null)).toThrow(ValidationError);
  });

  it('deve falhar quando formato de e-mail for inválido (caso de erro)', () => {
    // Arrange + Act + Assert
    expect(() => new Email('email-invalido')).toThrow(ValidationError);
  });
});
