import { NotFoundError } from '../../../application/errors/not-found.error.js';
import { logger } from '../../../shared/logger/console-logger.js';
import { toHttpProduct } from '../presenters/product.presenter.js';

export class ProductController {
  constructor(productService) {
    this.productService = productService;
  }

  create = async (req, res) => {
    const { name, price, amount } = req.body;
    logger.info('PRODUCT', 'CREATE REQUEST', { name, price, amount });

    const product = await this.productService.createProduct({ name, price, amount });
    const response = toHttpProduct(product);
    logger.info('PRODUCT', 'CREATE SUCCESS', { response });

    return res.status(201).json(response);
  };

  getById = async (req, res) => {
    const { id } = req.params;
    logger.info('PRODUCT', 'GET BY ID REQUEST', { id });

    const product = await this.productService.getProductById(id);
    if (!product) {
      throw new NotFoundError('Produto não encontrado');
    }

    const response = toHttpProduct(product);
    logger.info('PRODUCT', 'GET BY ID SUCCESS', { id, response });

    return res.status(200).json(response);
  };
}
