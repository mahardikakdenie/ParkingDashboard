import { apiClient } from '@/lib/api-client';
import {
  LoginDto,
  LoginResponse,
  RequestOtpDto,
  VerifyOtpDto,
  ForgotResponse,
  ResetPasswordDto,
} from '@/types/api';

export const authService = {
  login(data: LoginDto) {
    return apiClient.post<LoginResponse>('/auth/login', data);
  },

  requestOtp(data: RequestOtpDto) {
    return apiClient.post<ForgotResponse>('/auth/request-otp', data);
  },

  verifyOtp(data: VerifyOtpDto) {
    return apiClient.post<ForgotResponse>('/auth/verify-otp', data);
  },

  resetPassword(data: ResetPasswordDto) {
    return apiClient.post<{ message: string }>('/auth/reset-password', data);
  },
};
