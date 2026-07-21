import { apiClient } from '@/lib/api-client';
import { UpdateMenuDto, MenuResponse } from '@/types/api';

export const menusService = {
  getAll() {
    return apiClient.get<MenuResponse[]>('/menus');
  },

  getOptions() {
    return apiClient.get<any[]>('/menus/options');
  },

  update(id: string, data: UpdateMenuDto) {
    return apiClient.patch<null>(`/menus/${id}`, data);
  },
};
