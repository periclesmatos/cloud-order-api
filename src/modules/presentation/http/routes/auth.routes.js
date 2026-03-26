import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';

export function createAuthRouter(authController) {
  const router = Router();

  router.post('/users/register', authController.registerUser);
  router.post('/users/login', authController.loginUser);
  router.post('/customers/login', authController.loginCustomer);
  router.get('/me', requireAuth, authController.getMe);

  return router;
}
