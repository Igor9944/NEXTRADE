import { Router } from 'express';
import { CartController } from '../controllers/cartController';

export const createCartRoutes = (cartController: CartController) => {
  const router = Router();

  router.get('/', cartController.getCart);
  router.post('/items', cartController.addItem);
  router.patch('/items/:itemId', cartController.updateItem);
  router.delete('/items/:itemId', cartController.removeItem);

  return router;
};

export default createCartRoutes;
