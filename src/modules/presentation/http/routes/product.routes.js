import { Router } from 'express';

export function createProductsRouter(productController) {
  const router = Router();

  router.post('/', productController.create);
  router.get('/:id', productController.getById);
  router.put('/:id', productController.update);
  router.delete('/:id', productController.delete);
  router.patch('/:id/status', productController.updateStatus);
  router.get('/', (req, res) => {
    if (req.query.name) {
      return productController.getByName(req, res);
    }
    return productController.getAll(req, res);
  });

  return router;
}
