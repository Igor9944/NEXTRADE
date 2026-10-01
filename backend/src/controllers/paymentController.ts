import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { PaymentService } from '../services/paymentService';
import { Actor } from '../types/payment';
import { AppError } from '../utils/appError';

export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  private actor(req: AuthRequest): Actor {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    return req.user;
  }

  private param(req: AuthRequest, name: string): string {
    const value = req.params[name];
    return Array.isArray(value) ? value[0] : value;
  }

  private handle(error: unknown, res: Response, next: NextFunction) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message
      });
    }
    return next(error);
  }

  initiate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (req.body?.status || req.body?.statut_transaction) {
        throw new AppError('Payment status cannot be set by the client', 400);
      }
      const orderId = String(req.body?.order_id || '');
      if (!orderId) {
        throw new AppError('order_id is required', 400);
      }
      const result = await this.paymentService.initiatePayment(this.actor(req), orderId);
      return res.status(result.reused ? 200 : 201).json({ status: 'success', data: result });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  confirmSandbox = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.paymentService.confirmSandboxDemo(this.actor(req), this.param(req, 'id'));
      return res.status(200).json({
        status: 'success',
        data: {
          duplicate: result.duplicate,
          notification: result.notification,
          transaction: result.transaction
        }
      });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const transaction = await this.paymentService.getTransaction(this.actor(req), this.param(req, 'id'));
      return res.status(200).json({ status: 'success', data: transaction });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  listByOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const transactions = await this.paymentService.listOrderTransactions(this.actor(req), this.param(req, 'id'));
      return res.status(200).json({ status: 'success', data: { transactions } });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  webhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));
      const result = await this.paymentService.handleWebhook(req.headers as Record<string, string | string[] | undefined>, raw);
      return res.status(200).json({
        status: 'success',
        data: {
          duplicate: result.duplicate,
          notification: result.notification,
          transaction: result.transaction
        }
      });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };
}
