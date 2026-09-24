import { Router } from 'express';
import { OrderController } from '../controllers/orderController';

export const createOrderRoutes = (orderController: OrderController) => {
  const router = Router();

  router.get('/', orderController.getMyOrders);
  router.get('/:id', orderController.getOrderById);
  router.post('/', orderController.createOrder);
  router.patch('/:id/status', orderController.updateStatus);

  return router;
};

export default createOrderRoutes;
