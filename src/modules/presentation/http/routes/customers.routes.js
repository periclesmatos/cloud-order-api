import { Router } from 'express';
import { requireCustomerOwnerOrUser, requireCustomer } from '../middlewares/auth.js';

export function createCustomersRouter(customerController) {
  const router = Router();

  router.post('/', customerController.create);
  router.get('/phone/:phone', customerController.getByPhone);
  router.get('/me', requireCustomer, customerController.getMe);
  router.get('/:id', requireCustomerOwnerOrUser('id'), customerController.getById);
  router.put('/:id', requireCustomerOwnerOrUser('id'), customerController.update);
  router.delete('/:id', requireCustomerOwnerOrUser('id'), customerController.delete);

  router.post('/:id/addresses', requireCustomerOwnerOrUser('id'), customerController.createAddress);
  router.put('/:id/addresses/:addressId', requireCustomerOwnerOrUser('id'), customerController.updateAddress);
  router.delete('/:id/addresses/:addressId', requireCustomerOwnerOrUser('id'), customerController.deleteAddress);

  return router;
}
