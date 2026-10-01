import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { requireRole } from '../middlewares/roleMiddleware';

export const createNotificationRoutes = (controller: NotificationController) => {
  const router = Router();
  router.get('/', requireRole('ADMIN', 'CLIENT', 'FOURNISSEUR', 'COMMERCANT', 'TRANSPORTEUR'), controller.listMine);
  return router;
};
