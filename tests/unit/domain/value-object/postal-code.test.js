import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../../../src/modules/domain/errors/validation.error.js';
import { PostalCode } from '../../../../src/modules/domain/value-object/postal-code.js';

describe('PostalCode', () => {
  it('deve normalizar CEP sem hífen (fluxo feliz)', () => {
    // Arrange
    const postalCode = new PostalCode('60000000');

    // Act
    const resultado = postalCode.toString();

    // Assert
    expect(resultado).toBe('60000-000');
  });

  it('deve manter CEP com hífen (fluxo feliz)', () => {
    // Arrange
    const postalCode = new PostalCode('60000-000');

    // Act
    const resultado = postalCode.toString();

    // Assert
    expect(resultado).toBe('60000-000');
  });

  it('deve falhar quando formato do CEP for inválido (caso de erro)', () => {
    // Arrange + Act + Assert
    expect(() => new PostalCode('6000-000')).toThrow(ValidationError);
  });

  it('deve aceitar instância de PostalCode como entrada (caso de borda)', () => {
    // Arrange
    const source = new PostalCode('60123456');

    // Act
    const copy = new PostalCode(source);

    // Assert
    expect(copy.toString()).toBe('60123-456');
  });
});
