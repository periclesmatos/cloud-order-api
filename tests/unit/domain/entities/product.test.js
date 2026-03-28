import { describe, expect, it } from 'vitest';
import { Product } from '../../../../src/modules/domain/entities/product.js';
import { ValidationError } from '../../../../src/modules/domain/errors/validation.error.js';
import { Price } from '../../../../src/modules/domain/value-object/price.js';

describe('Product', () => {
  it('deve criar produto com preco como value object (fluxo feliz)', () => {
    const product = Product.create({
      id: 'prod-1',
      name: 'Camiseta',
      price: 49.9,
      amount: 10,
      description: 'Camiseta de qualidade',
    });

    expect(product.price).toBeInstanceOf(Price);
    expect(product.price.toNumber()).toBe(49.9);
  });

  it('deve alterar preco com arredondamento de duas casas (fluxo feliz)', () => {
    const product = Product.create({
      id: 'prod-1',
      name: 'Camiseta',
      price: 49.9,
      amount: 10,
      description: 'Camiseta de qualidade',
    });

    product.changePrice(50.555);

    expect(product.price.toNumber()).toBe(50.55);
  });

  it('deve falhar quando preco for invalido (caso de erro)', () => {
    const product = Product.create({
      id: 'prod-1',
      name: 'Camiseta',
      price: 49.9,
      amount: 10,
      description: 'Camiseta de qualidade',
    });

    expect(() => product.changePrice(-1)).toThrow(ValidationError);
    expect(() => Product.create({ id: 'prod-1', name: 'Camiseta', price: null, amount: 10 })).toThrow(ValidationError);
  });
});
