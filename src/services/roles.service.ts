import { apiClient } from '@/lib/api-client';
import {
  CreateRoleDto,
  UpdateRoleDto,
  DetailRoleResponse,
  RoleOptionsResponse,
  ListRoleResponse,
  BaseQueryParams,
} from '@/types/api';

export const rolesService = {
  getList(params: BaseQueryParams) {
    return apiClient.get<ListRoleResponse>('/roles/list', params);
  },

  getOptions() {
    return apiClient.get<RoleOptionsResponse[]>('/roles/options');
  },

  getAssignment() {
    return apiClient.get<any>('/roles/assignments');
  },

  getDetail(id: string) {
    return apiClient.get<DetailRoleResponse>(`/roles/detail/${id}`);
  },

  create(data: CreateRoleDto) {
    return apiClient.post<null>('/roles', data);
  },

  update(id: string, data: UpdateRoleDto) {
    return apiClient.patch<null>(`/roles/${id}`, data);
  },
};
