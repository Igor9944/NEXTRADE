import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { CartService } from '../services/cartService';

export class CartController {
  constructor(private cartService: CartService) {}

  getCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const cart = await this.cartService.getCart(req.user!.id);
      if (!cart) {
        return res.status(200).json({ status: 'success', data: { id_cart: null, id_client: req.user!.id, items: [], total: '0.00' } });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          ...cart,
          total: Number(cart.total).toFixed(2)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  addItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { productId, quantity } = req.body || {};
      const item = await this.cartService.addItem(req.user!.id, productId, quantity);
      return res.status(201).json({
        status: 'success',
        data: {
          ...item,
          quantity: Number(item.quantite)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  updateItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const itemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
      const { quantity } = req.body || {};
      const item = await this.cartService.updateItem(req.user!.id, itemId, quantity);

      if (!item) {
        return res.status(404).json({ status: 'error', message: 'Cart item not found' });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          ...item,
          quantity: Number(item.quantite)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  removeItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const itemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
      const deleted = await this.cartService.removeItem(req.user!.id, itemId);

      if (!deleted) {
        return res.status(404).json({ status: 'error', message: 'Cart item not found' });
      }

      return res.status(200).json({ status: 'success', message: 'Cart item removed' });
    } catch (error) {
      next(error);
    }
  };
}
