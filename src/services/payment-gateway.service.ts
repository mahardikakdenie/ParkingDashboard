import { apiClient } from '@/lib/api-client';
import { PaymentWebhookResponse } from '@/types/api';

export const paymentGatewayService = {
  triggerWebhook(provider: string, payload: Record<string, any>) {
    return apiClient.post<PaymentWebhookResponse>(
      `/payment-gateway/webhooks/${encodeURIComponent(provider)}`,
      payload
    );
  },
};
