import { apiClient, getDataMode } from './api';
import { AnalyticsOverview } from '../types';
import { INITIAL_ANALYTICS } from '../utils/mockData';

export const analyticsService = {
  /**
   * Get analytics overview metrics
   */
  async getOverview(): Promise<{ data: AnalyticsOverview; isDemo: boolean; isUnavailable?: boolean }> {
    const mode = getDataMode();
    if (mode === 'live') {
      try {
        const response = await apiClient.get<AnalyticsOverview>('/analytics/overview');
        return { data: response.data, isDemo: false };
      } catch (err) {
        console.warn('Backend GET /analytics/overview not implemented or unavailable:', err);
        return {
          data: {
            totalVideos: 0,
            completedVideos: 0,
            processingVideos: 0,
            failedJobs: 0,
            successRate: 0,
            averageProcessingTimeSec: 0,
            activityTimeline: [],
            stageDurations: [],
            topProducts: [],
            languageDistribution: [],
            ratioDistribution: []
          },
          isDemo: false,
          isUnavailable: true
        };
      }
    }

    return { data: INITIAL_ANALYTICS, isDemo: true };
  }
};
