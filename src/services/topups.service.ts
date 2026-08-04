import { apiClient } from '@/lib/api-client';
import {
  CreateTopupDto,
  CreateTopupResponse,
  DetailTopupResponse,
  ListTopupResponse,
  ListTopupQueryParams,
} from '@/types/api';

export const topupsService = {
  getList(params?: ListTopupQueryParams) {
    return apiClient.get<ListTopupResponse>('/topups/list', params);
  },

  getDetail(id: string) {
    return apiClient.get<DetailTopupResponse>(`/topups/detail/${id}`);
  },

  create(data: CreateTopupDto) {
    return apiClient.post<CreateTopupResponse>('/topups', data);
  },
};
