import { apiClient } from '@/lib/api-client';
import {
  CheckInDto,
  CheckInResponse,
  CheckOutDto,
  CheckOutResponse,
} from '@/types/api';

export const demoService = {
  /**
   * Post Check-In data for vehicle entry simulation
   * Endpoint: POST /demo/check-in
   */
  checkIn(data: CheckInDto): Promise<CheckInResponse> {
    return apiClient.post<CheckInResponse>('/demo/check-in', data);
  },

  /**
   * Post Check-Out data for vehicle exit simulation
   * Endpoint: POST /demo/check-out
   */
  checkOut(data: CheckOutDto): Promise<CheckOutResponse> {
    return apiClient.post<CheckOutResponse>('/demo/check-out', data);
  },
};
