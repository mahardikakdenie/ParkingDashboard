import { apiClient } from '@/lib/api-client';
import {
  CreateTopupDto,
  DetailTopupResponse,
  ListTopupResponse,
  BaseQueryParams,
} from '@/types/api';

export const topupsService = {
  getList(params: BaseQueryParams) {
    return apiClient.get<ListTopupResponse>('/topups/list', params);
  },

  getDetail(id: string) {
    return apiClient.get<DetailTopupResponse>(`/topups/detail/${id}`);
  },

  create(data: CreateTopupDto) {
    return apiClient.post<null>('/topups', data);
  },
};
