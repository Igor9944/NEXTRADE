import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { AnalyticsService } from '../services/analyticsService';
import { AnalyticsPeriod } from '../repositories/analyticsRepository';

export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  overview = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const raw = String(req.query.period || '30d');
      const period = (['7d', '30d', '90d', 'year'].includes(raw) ? raw : '30d') as AnalyticsPeriod;
      const data = await this.analyticsService.overview(period);
      return res.status(200).json({ status: 'success', data });
    } catch (error) {
      return next(error);
    }
  };
}
