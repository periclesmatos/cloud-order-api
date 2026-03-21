import { Router } from 'express';

export function createAuthRouter(authController) {
  const router = Router();

  router.post('/users/register', authController.registerUser);
  router.post('/users/login', authController.loginUser);
  router.post('/customers/login', authController.loginCustomer);

  return router;
}
