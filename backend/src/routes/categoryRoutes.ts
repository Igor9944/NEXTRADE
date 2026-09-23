import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { CategoryController } from '../controllers/categoryController';

/**
 * Create category routes
 * @param categoryController - Category controller instance
 * @returns Express router
 */
export const createCategoryRoutes = (categoryController: CategoryController) => {
  const router = Router();

  router.post('/', authMiddleware, requireRole('ADMIN'), categoryController.createCategory);
  router.get('/', categoryController.listCategories);

  return router;
};

export default createCategoryRoutes;
