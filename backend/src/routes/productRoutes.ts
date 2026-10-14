import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { ProductController } from '../controllers/productController';

/**
 * Create product routes
 * @param productController - Product controller instance
 * @returns Express router
 */
export const createProductRoutes = (productController: ProductController) => {
  const router = Router();

  router.post('/', authMiddleware, requireRole('FOURNISSEUR', 'ADMIN'), productController.createProduct);
  router.get('/catalog', authMiddleware, requireRole('CLIENT', 'COMMERCANT', 'FOURNISSEUR', 'ADMIN'), productController.getCatalog);
  router.get('/:id', authMiddleware, requireRole('CLIENT', 'COMMERCANT', 'FOURNISSEUR', 'ADMIN'), productController.getById);

  return router;
};

export default createProductRoutes;
