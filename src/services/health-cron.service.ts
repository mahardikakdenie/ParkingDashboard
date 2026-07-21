import { apiClient } from '@/lib/api-client';
import { HealthResponseDto, CleanupCronResponse } from '@/types/api';

export const healthCronService = {
  checkHealth() {
    return apiClient.get<HealthResponseDto>('/health');
  },

  cleanupCron() {
    return apiClient.get<CleanupCronResponse>('/cron/cleanup');
  },
};
