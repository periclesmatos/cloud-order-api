import { Router } from 'express';
import { createCustomersRouter } from './customers.routes.js';
import { createOrdersRouter } from './orders.routes.js';
import { createProductsRouter } from './product.routes.js';
import { createAuthRouter } from './auth.routes.js';

export function createHttpRoutes({ customerController, productController, orderController, authController }) {
  const router = Router();

  router.use('/customers', createCustomersRouter(customerController));
  router.use('/products', createProductsRouter(productController));
  router.use('/orders', createOrdersRouter(orderController));
  router.use('/auth', createAuthRouter(authController));

  return router;
}
