import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { OrderService } from '../services/orderService';

export class OrderController {
  constructor(private orderService: OrderService) {}

  createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const order = await this.orderService.createOrder(req.user!.id, req.body || {});
      return res.status(201).json({ status: 'success', data: order });
    } catch (error: any) {
      const status = /stock|empty|not found|unauthorized/i.test(error.message || '') ? 400 : 500;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to create order'
      });
    }
  };

  getMyOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orders = await this.orderService.getUserOrders(req.user!.id);
      return res.status(200).json({ status: 'success', data: orders });
    } catch (error) {
      next(error);
    }
  };

  getOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orderId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const order = await this.orderService.getOrderById(req.user!.id, orderId);
      return res.status(200).json({ status: 'success', data: order });
    } catch (error: any) {
      const status = /unauthorized|not found/i.test(error.message || '') ? 403 : 500;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to fetch order'
      });
    }
  };

  updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orderId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { statut } = req.body || {};
      const order = await this.orderService.updateStatus(req.user!.id, orderId, statut);
      return res.status(200).json({ status: 'success', data: order });
    } catch (error: any) {
      const status = /unauthorized|not found|cancelled/i.test(error.message || '') ? 400 : 500;
      return res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to update order status'
      });
    }
  };
}
