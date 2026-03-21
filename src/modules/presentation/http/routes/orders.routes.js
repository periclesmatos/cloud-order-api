import { Router } from 'express';

export function createOrdersRouter(orderController) {
  const router = Router();

  router.post('/', orderController.create);
  router.get('/customer/:customerId', orderController.getByCustomerId);
  router.patch('/:id/status', orderController.updateStatus);
  router.get('/:id', orderController.getById);
  router.get('/', orderController.getAll);

  return router;
}
