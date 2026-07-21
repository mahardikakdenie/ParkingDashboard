import { apiClient } from '@/lib/api-client';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  DetailApplicationResponse,
  OptionsApplicationResponse,
  ListApplicationResponse,
  BaseQueryParams,
} from '@/types/api';

export const applicationsService = {
  getList(params: BaseQueryParams) {
    return apiClient.get<ListApplicationResponse>('/applications/list', params);
  },

  getOptions() {
    return apiClient.get<OptionsApplicationResponse[]>('/applications/options');
  },

  getDetail(id: string) {
    return apiClient.get<DetailApplicationResponse>(`/applications/detail/${id}`);
  },

  create(data: CreateApplicationDto) {
    return apiClient.post<null>('/applications', data);
  },

  update(id: string, data: UpdateApplicationDto) {
    return apiClient.patch<null>(`/applications/${id}`, data);
  },
};
