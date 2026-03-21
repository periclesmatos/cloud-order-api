import { Router } from 'express';
import { requireAuth, requireUser } from '../middlewares/auth.js';

export function createProductsRouter(productController) {
  const router = Router();

  router.post('/', requireUser, productController.create);
  router.get('/:id', requireAuth, productController.getById);
  router.put('/:id', requireUser, productController.update);
  router.delete('/:id', requireUser, productController.delete);
  router.patch('/:id/status', requireUser, productController.updateStatus);
  router.get('/', (req, res) => {
    if (req.query.name) {
      return productController.getByName(req, res);
    }
    return productController.getAll(req, res);
  });

  return router;
}
