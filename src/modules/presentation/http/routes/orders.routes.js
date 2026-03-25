import { Router } from 'express';
import { requireAuth, requireUser, requireCustomer } from '../middlewares/auth.js';

export function createOrdersRouter(orderController) {
  const router = Router();

  router.post('/', requireAuth, orderController.create);
  router.get('/me', requireCustomer, orderController.getMe);
  router.get('/customer/:customerId', requireAuth, orderController.getByCustomerId);
  router.patch('/:id/status', requireUser, orderController.updateStatus);
  router.get('/:id', requireAuth, orderController.getById);
  router.get('/', requireAuth, orderController.getAll);

  return router;
}
