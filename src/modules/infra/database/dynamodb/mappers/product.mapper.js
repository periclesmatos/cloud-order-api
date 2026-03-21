import { Product } from '../../../../domain/entities/product.js';

export class ProductDynamoDBMapper {
  static normalizeName(name) {
    return String(name).trim().replace(/^['"]+|['"]+$/g, '').trim().toLowerCase();
  }

  static toProductItem(product) {
    return {
      PK: `PRODUCT#${product.id}`,
      SK: `PROFILE`,
      type: 'PRODUCT',
      productId: product.id,
      name: product.name,
      nameNormalized: ProductDynamoDBMapper.normalizeName(product.name),
      price: String(Math.round(product.price.toNumber() * 100)),
      amount: String(product.amount),
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  static toDomainProduct(item) {
    return new Product({
      id: item.productId,
      name: item.name,
      price: Number(item.price) / 100,
      amount: Number(item.amount),
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  }
}
