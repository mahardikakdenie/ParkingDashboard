import { apiClient } from '@/lib/api-client';
import { BankItem, PaymentMethodItem, PaymentMethodOption } from '@/types/api';

export const paymentMethodsService = {
  /**
   * Fetches available payment method options including nested bank lists.
   * Endpoint: GET /payment-methods/options
   */
  getOptions() {
    return apiClient.get<PaymentMethodOption[]>('/payment-methods/options');
  },

  /**
    * Fetches list of supported banks.
    * Endpoint: GET /banks
    */
  getBanks() {
    return apiClient.get<BankItem[]>('/banks');
  },

  /**
    * Fetches all registered payment methods.
    * Endpoint: GET /payment-methods
    */
  getList() {
    return apiClient.get<PaymentMethodItem[]>('/payment-methods');
  },
};
