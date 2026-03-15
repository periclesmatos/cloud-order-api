import { Router } from 'express';

export function createProductsRouter(productController) {
  const router = Router();

  router.post('/', productController.create);
  router.get('/:id', productController.getById);

  return router;
}