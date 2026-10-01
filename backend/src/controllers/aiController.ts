import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { AiService } from '../services/aiService';
import { AnalyticsService } from '../services/analyticsService';

export class AiController {
  constructor(
    private aiService: AiService,
    private analyticsService: AnalyticsService
  ) {}

  chat = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Authentication required' });
      }
      const language = req.body?.language === 'en' || req.body?.language === 'ar' ? req.body.language : 'fr';
      const facts = req.user.role === 'ADMIN'
        ? { overview: (await this.analyticsService.overview('30d')).kpis }
        : undefined;
      const data = await this.aiService.chat({
        message: String(req.body?.message || ''),
        language,
        role: req.user.role,
        context: req.body?.context,
        facts
      });
      return res.status(200).json({ status: 'success', data });
    } catch (error) {
      return next(error);
    }
  };
}
