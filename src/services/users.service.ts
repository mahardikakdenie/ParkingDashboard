import { apiClient } from '@/lib/api-client';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateAccountUserDto,
  ChangePasswordUserDto,
  DetailUserResponse,
  ListUserResponse,
  ResourceUserResponse,
  BaseQueryParams,
} from '@/types/api';

export const usersService = {
  getResource() {
    return apiClient.get<ResourceUserResponse>('/users/resource');
  },

  getList(params: BaseQueryParams) {
    return apiClient.get<ListUserResponse>('/users/list', params);
  },

  getDetail(id: string) {
    return apiClient.get<DetailUserResponse>(`/users/detail/${id}`);
  },

  getExport(params?: BaseQueryParams) {
    return apiClient.get<string>('/users/export', params);
  },

  create(data: CreateUserDto) {
    return apiClient.post<null>('/users', data);
  },

  updateAccount(data: UpdateAccountUserDto) {
    return apiClient.patch<null>('/users/account', data);
  },

  changePassword(data: ChangePasswordUserDto) {
    return apiClient.patch<null>('/users/change-password', data);
  },

  update(id: string, data: UpdateUserDto) {
    return apiClient.patch<null>(`/users/${id}`, data);
  },
};
