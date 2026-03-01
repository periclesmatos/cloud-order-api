import { Router } from 'express';

export function createCustomersRouter(customerController) {
  const router = Router();

  router.post('/', customerController.create);
  router.get('/phone/:phone', customerController.getByPhone);
  router.get('/:id', customerController.getById);
  router.put('/:id', customerController.update);
  router.delete('/:id', customerController.delete);

  router.post('/:id/addresses', customerController.createAddress);
  router.put('/:id/addresses/:addressId', customerController.updateAddress);
  router.delete('/:id/addresses/:addressId', customerController.deleteAddress);

  return router;
}
