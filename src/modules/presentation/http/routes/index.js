import { Router } from 'express';
import { createCustomersRouter } from './customers.routes.js';
import { createProductsRouter } from './product.routes.js';

export function createHttpRoutes({ customerController, productController }) {
  const router = Router();

  router.use('/customers', createCustomersRouter(customerController));
  router.use('/products', createProductsRouter(productController));

  return router;
}
