import { AnalyticsPeriod, AnalyticsRepository, periodStart } from '../repositories/analyticsRepository';

export class AnalyticsService {
  constructor(private analytics: AnalyticsRepository) {}

  async overview(period: AnalyticsPeriod = '30d') {
    const from = periodStart(period);
    const data = await this.analytics.overview(from);
    return {
      period,
      from: from.toISOString(),
      ...data
    };
  }
}
