import { apiClient } from '@/lib/api-client';
import {
  DetailTransactionResponse,
  ListTransactionResponse,
  BaseQueryParams,
} from '@/types/api';

export const transactionsService = {
  getList(params: BaseQueryParams) {
    return apiClient.get<ListTransactionResponse>('/transactions/list', params);
  },

  getDetail(id: string) {
    return apiClient.get<DetailTransactionResponse>(`/transactions/detail/${id}`);
  },

  getExport(params?: BaseQueryParams) {
    return apiClient.get<string>('/transactions/export', params);
  },
};
