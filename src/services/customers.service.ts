import { apiClient } from '@/lib/api-client';
import {
  DetailCustomerResponse,
  ListCustomerResponse,
  BaseQueryParams,
} from '@/types/api';

export const customersService = {
  getList(params: BaseQueryParams) {
    return apiClient.get<ListCustomerResponse>('/customers/list', params);
  },

  getDetail(id: string) {
    return apiClient.get<DetailCustomerResponse>(`/customers/detail/${id}`);
  },

  getExport(params?: BaseQueryParams) {
    return apiClient.get<string>('/customers/export', params);
  },
};
