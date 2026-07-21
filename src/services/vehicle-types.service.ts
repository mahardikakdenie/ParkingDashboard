import { apiClient } from '@/lib/api-client';
import {
  CreateVehicleTypeDto,
  UpdateVehicleTypeDto,
  DetailVehicleTypeResponse,
  VehicleTypeOptionsResponse,
  ListVehicleTypeResponse,
  BaseQueryParams,
} from '@/types/api';

export const vehicleTypesService = {
  getList(params: BaseQueryParams) {
    return apiClient.get<ListVehicleTypeResponse>('/vehicle-types/list', params);
  },

  getOptions() {
    return apiClient.get<VehicleTypeOptionsResponse[]>('/vehicle-types/options');
  },

  getDetail(id: string) {
    return apiClient.get<DetailVehicleTypeResponse>(`/vehicle-types/detail/${id}`);
  },

  create(data: CreateVehicleTypeDto) {
    return apiClient.post<null>('/vehicle-types', data);
  },

  update(id: string, data: UpdateVehicleTypeDto) {
    return apiClient.patch<null>(`/vehicle-types/${id}`, data);
  },
};
