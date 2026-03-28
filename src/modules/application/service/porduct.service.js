import { Product } from '../../domain/entities/product.js';
import { NotFoundError } from '../errors/not-found.error.js';
import { ValidationError } from '../../domain/errors/validation.error.js';

export class ProductService {
  constructor(productRepository, uuidGenerator) {
    this.productRepository = productRepository;
    this.uuidGenerator = uuidGenerator;
  }

  async createProduct(product_data) {
    const { name, price, amount, description } = product_data;
    const id = this.uuidGenerator.generate();
    const product = Product.create({ id, name, price, amount, description });
    const savedProduct = await this.productRepository.saveProduct(product);
    return savedProduct;
  }

  async getProductById(product_id) {
    const product = await this.productRepository.findById(product_id);
    return product;
  }

  async getProductsByName(name, filters = {}) {
    const products = await this.productRepository.findByName(name, filters);
    return products;
  }

  async getAllProducts(filters = {}) {
    const products = await this.productRepository.findAll(filters);
    return products;
  }

  async updateProduct(product_id, update_data) {
    const product = await this.productRepository.findById(product_id);
    if (!product) {
      throw new NotFoundError('Produto não encontrado');
    }

    const { name, price, amount, description } = update_data;

    if (name !== undefined) product.changeName(name);
    if (price !== undefined) product.changePrice(price);
    if (amount !== undefined) product.changeAmount(amount);
    if (description !== undefined) product.changeDescription(description);

    const updatedProduct = await this.productRepository.update(product);
    return updatedProduct;
  }

  async deleteProduct(product_id) {
    const product = await this.productRepository.findById(product_id);
    if (!product) {
      throw new NotFoundError('Produto não encontrado');
    }

    await this.productRepository.deleteById(product_id);
  }

  async setProductStatus(product_id, isActive) {
    if (typeof isActive !== 'boolean') {
      throw new ValidationError('isActive deve ser booleano');
    }

    const product = await this.productRepository.findById(product_id);
    if (!product) {
      throw new NotFoundError('Produto não encontrado');
    }

    if (isActive) {
      product.activate();
    } else {
      product.deactivate();
    }

    const updatedProduct = await this.productRepository.update(product);
    return updatedProduct;
  }
} 
