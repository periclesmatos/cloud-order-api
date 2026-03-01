import { Router } from 'express';
import { createCustomersRouter } from './customers.routes.js';

export function createHttpRoutes({ customerController }) {
  const router = Router();

  router.get('/', (req, res) => {
    res.send('SERVER IS RUNNING');
  });

  router.use('/customers', createCustomersRouter(customerController));

  return router;
}
