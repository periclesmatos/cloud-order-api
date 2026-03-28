import { describe, expect, it } from 'vitest';
import { Product } from '../../../../../src/modules/domain/entities/product.js';
import { ProductDynamoDBMapper } from '../../../../../src/modules/infra/database/dynamodb/mappers/product.mapper.js';

describe('ProductDynamoDBMapper (unit)', () => {
  it('deve normalizar nome removendo aspas ao redor (fluxo feliz)', () => {
    const normalized = ProductDynamoDBMapper.normalizeName('"PlayStation 5"');
    expect(normalized).toBe('playstation 5');
  });

  it('deve mapear produto para item do DynamoDB com nome normalizado e preco em centavos (fluxo feliz)', () => {
    const product = Product.create({
      id: 'prod-1',
      name: '  Camiseta Premium  ',
      price: 49.9,
      amount: 5,
      description: 'Camiseta de algodao premium',
    });

    const item = ProductDynamoDBMapper.toProductItem(product);

    expect(item.PK).toBe('PRODUCT#prod-1');
    expect(item.SK).toBe('PROFILE');
    expect(item.type).toBe('PRODUCT');
    expect(item.nameNormalized).toBe('camiseta premium');
    expect(item.price).toBe('4990');
  });

  it('deve mapear item do DynamoDB para produto convertendo centavos para valor decimal (fluxo feliz)', () => {
    const item = {
      PK: 'PRODUCT#prod-2',
      SK: 'PROFILE',
      type: 'PRODUCT',
      productId: 'prod-2',
      name: 'Tenis',
      nameNormalized: 'tenis',
      description: 'Tennis esportivo resistente',
      price: '12345',
      amount: '3',
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z',
    };

    const product = ProductDynamoDBMapper.toDomainProduct(item);

    expect(product.id).toBe('prod-2');
    expect(product.name).toBe('Tenis');
    expect(product.price.toNumber()).toBe(123.45);
    expect(product.amount).toBe(3);
  });
});
