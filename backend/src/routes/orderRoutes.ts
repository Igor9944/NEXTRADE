import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { DocumentController } from '../controllers/documentController';
import { PaymentController } from '../controllers/paymentController';
import { requireRole } from '../middlewares/roleMiddleware';

export const createOrderRoutes = (
  orderController: OrderController,
  documentController?: DocumentController,
  paymentController?: PaymentController
) => {
  const router = Router();

  router.get('/', orderController.getMyOrders);
  router.post('/', orderController.createOrder);
  if (documentController) {
    router.get('/:id/documents', documentController.listOrderDocuments);
    router.post('/:id/invoice', requireRole('ADMIN'), documentController.generateInvoice);
    router.post('/:id/packing-list', requireRole('ADMIN'), documentController.generatePackingList);
  }
  if (paymentController) {
    router.get('/:id/transactions', paymentController.listByOrder);
  }
  router.get('/:id', orderController.getOrderById);
  router.patch('/:id/status', orderController.updateStatus);

  return router;
};

export default createOrderRoutes;
