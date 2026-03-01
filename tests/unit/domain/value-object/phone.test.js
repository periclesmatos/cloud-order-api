import { describe, expect, it } from 'vitest';
import { Phone } from '../../../../src/modules/domain/value-object/phone.js';
import { ValidationError } from '../../../../src/modules/domain/errors/validation.error.js';

describe('Phone', () => {
  it('deve normalizar telefone sem prefixo de mais (fluxo feliz)', () => {
    // Arrange
    const phone = new Phone('5511999999999');

    // Act
    const resultado = phone.toString();

    // Assert
    expect(resultado).toBe('+5511999999999');
  });

  it('deve manter telefone com prefixo de mais sem alterações (fluxo feliz)', () => {
    // Arrange
    const phone = new Phone('+5511999999999');

    // Act
    const resultado = phone.toString();

    // Assert
    expect(resultado).toBe('+5511999999999');
  });

  it('deve falhar quando formato do telefone for inválido (caso de erro)', () => {
    // Arrange + Act + Assert
    expect(() => new Phone('abc')).toThrow(ValidationError);
  });
});
