import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { requireRole } from '../middlewares/roleMiddleware';

export const createPaymentRoutes = (controller: PaymentController) => {
  const router = Router();
  router.post('/', requireRole('CLIENT', 'ADMIN'), controller.initiate);
  router.get('/:id', requireRole('CLIENT', 'ADMIN'), controller.getById);
  return router;
};
