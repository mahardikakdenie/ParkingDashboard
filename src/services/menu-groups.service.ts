import { apiClient } from '@/lib/api-client';
import {
  CreateMenuGroupDto,
  UpdateMenuGroupDto,
  DetailMenuGroupResponse,
  MenuGroupOptionsResponse,
  ListMenuGroupResponse,
  BaseQueryParams,
} from '@/types/api';

export const menuGroupsService = {
  getList(params: BaseQueryParams) {
    return apiClient.get<ListMenuGroupResponse>('/menu-groups/list', params);
  },

  getOptions() {
    return apiClient.get<MenuGroupOptionsResponse[]>('/menu-groups/options');
  },

  getDetail(id: string) {
    return apiClient.get<DetailMenuGroupResponse>(`/menu-groups/detail/${id}`);
  },

  create(data: CreateMenuGroupDto) {
    return apiClient.post<null>('/menu-groups', data);
  },

  update(id: string, data: UpdateMenuGroupDto) {
    return apiClient.patch<null>(`/menu-groups/${id}`, data);
  },
};
