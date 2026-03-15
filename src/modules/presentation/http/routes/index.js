import { Router } from 'express';
import { createCustomersRouter } from './customers.routes.js';
import { createProductsRouter } from './product.routes.js';

export function createHttpRoutes({ customerController, productController }) {
  const router = Router();

  router.get('/', (req, res) => {
    res.send('SERVER IS RUNNING');
  });

  router.use('/customers', createCustomersRouter(customerController));
  router.use('/products', createProductsRouter(productController));

  return router;
}
