import { apiClient } from '@/lib/api-client';
import {
  CreatePermissionDto,
  DetailPermissionResponse,
  ListPermissionResponse,
  PermissionItem,
  BaseQueryParams,
} from '@/types/api';

export const permissionsService = {
  getList(params: BaseQueryParams) {
    return apiClient.get<ListPermissionResponse>('/permissions/list', params);
  },

  getAll() {
    return apiClient.get<PermissionItem[]>('/permissions');
  },

  getDetail(id: string) {
    return apiClient.get<DetailPermissionResponse>(`/permissions/detail/${id}`);
  },

  create(data: CreatePermissionDto) {
    return apiClient.post<null>('/permissions', data);
  },
};
