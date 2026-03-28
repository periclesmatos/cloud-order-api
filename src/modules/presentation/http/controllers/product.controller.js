import { NotFoundError } from '../../../application/errors/not-found.error.js';
import { ValidationError } from '../../../domain/errors/validation.error.js';
import { logger } from '../../../shared/logger/console-logger.js';
import { toHttpProduct } from '../presenters/product.presenter.js';

function parseIsActiveQuery(value) {
  if (value === undefined) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new ValidationError('isActive deve ser true ou false');
}
export class ProductController {
  constructor(productService) {
    this.productService = productService;
  }

  create = async (req, res) => {
    const { name, price, amount, description } = req.body;
    logger.info('PRODUCT', 'CREATE REQUEST', { name, price, amount, description });

    const product = await this.productService.createProduct({ name, price, amount, description });
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

  getByName = async (req, res) => {
    const { name } = req.query;
    const isActive = parseIsActiveQuery(req.query.isActive);
    logger.info('PRODUCT', 'GET BY NAME REQUEST', { name, isActive });

    const products = await this.productService.getProductsByName(name, { isActive });
    const response = products.map(toHttpProduct);
    logger.info('PRODUCT', 'GET BY NAME SUCCESS', { name, isActive, count: response.length });

    return res.status(200).json(response);
  };

  getAll = async (req, res) => {
    const isActive = parseIsActiveQuery(req.query.isActive);
    logger.info('PRODUCT', 'GET ALL REQUEST', { isActive });

    const products = await this.productService.getAllProducts({ isActive });
    const response = products.map(toHttpProduct);
    logger.info('PRODUCT', 'GET ALL SUCCESS', { isActive, count: response.length });

    return res.status(200).json(response);  
  };

  update = async (req, res) => {
    const { id } = req.params;
    const { name, price, amount, description } = req.body;
    logger.info('PRODUCT', 'UPDATE REQUEST', { id, name, price, amount, description });

    const updatedProduct = await this.productService.updateProduct(id, { name, price, amount, description });
    const response = toHttpProduct(updatedProduct);
    logger.info('PRODUCT', 'UPDATE SUCCESS', { id, response });

    return res.status(200).json(response);
  };

  delete = async (req, res) => {
    const { id } = req.params;
    logger.info('PRODUCT', 'DELETE REQUEST', { id });

    await this.productService.deleteProduct(id);
    logger.info('PRODUCT', 'DELETE SUCCESS', { id });

    return res.status(204).send();
  };

  updateStatus = async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;
    logger.info('PRODUCT', 'UPDATE STATUS REQUEST', { id, isActive });

    const updatedProduct = await this.productService.setProductStatus(id, isActive);
    const response = toHttpProduct(updatedProduct);
    logger.info('PRODUCT', 'UPDATE STATUS SUCCESS', { id, response });

    return res.status(200).json(response);
  };
}
