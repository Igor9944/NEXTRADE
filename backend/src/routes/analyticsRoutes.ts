import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { requireRole } from '../middlewares/roleMiddleware';

export const createAnalyticsRoutes = (controller: AnalyticsController) => {
  const router = Router();
  router.get('/overview', requireRole('ADMIN'), controller.overview);
  router.get('/sales', requireRole('ADMIN'), controller.overview);
  router.get('/orders', requireRole('ADMIN'), controller.overview);
  router.get('/inventory', requireRole('ADMIN'), controller.overview);
  return router;
};
