import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../../../src/modules/domain/errors/validation.error.js';
import { Price } from '../../../../src/modules/domain/value-object/price.js';

describe('Price', () => {
  it('deve criar preco valido com duas casas decimais (fluxo feliz)', () => {
    const price = new Price(10.129);

    expect(price.toNumber()).toBe(10.13);
    expect(price.toString()).toBe('10.13');
  });

  it('deve aceitar string numerica (caso de borda)', () => {
    const price = new Price('19.9');

    expect(price.toNumber()).toBe(19.9);
    expect(price.toString()).toBe('19.90');
  });

  it('deve aceitar instancia de Price como entrada (caso de borda)', () => {
    const source = new Price(42);
    const copy = new Price(source);

    expect(copy.toNumber()).toBe(42);
  });

  it('deve falhar para preco ausente, invalido ou negativo (caso de erro)', () => {
    expect(() => new Price()).toThrow(ValidationError);
    expect(() => new Price('abc')).toThrow(ValidationError);
    expect(() => new Price(-1)).toThrow(ValidationError);
  });
});
