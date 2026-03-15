import { Product } from '../../domain/entities/product.js';

export class ProductService {
  constructor(productRepository, uuidGenerator) {
    this.productRepository = productRepository;
    this.uuidGenerator = uuidGenerator;
  }

  async createProduct(product_data) {
    const { name, price, amount } = product_data;
    const id = this.uuidGenerator.generate();
    const product = Product.create({ id, name, price, amount });
    const savedProduct = await this.productRepository.saveProduct(product);
    return savedProduct;
  }

  async getProductById(product_id) {
    const product = await this.productRepository.findById(product_id);
    return product;
  }
}