import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { NotificationService } from '../services/notificationService';
import { AppError } from '../utils/appError';

export class NotificationController {
  constructor(private notifications: NotificationService) {}

  listMine = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      const items = await this.notifications.listForRecipient(req.user.email, req.user.role);
      return res.status(200).json({ status: 'success', data: { notifications: items } });
    } catch (error) {
      return next(error);
    }
  };
}
