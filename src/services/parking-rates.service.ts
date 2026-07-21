import { apiClient } from '@/lib/api-client';
import {
  CreateParkingRateDto,
  UpdateParkingRateDto,
  DetailParkingRateResponse,
  ListParkingRateResponse,
  BaseQueryParams,
} from '@/types/api';

export const parkingRatesService = {
  getList(params: BaseQueryParams) {
    return apiClient.get<ListParkingRateResponse>('/parking-rates/list', params);
  },

  getDetail(id: string) {
    return apiClient.get<DetailParkingRateResponse>(`/parking-rates/detail/${id}`);
  },

  create(data: CreateParkingRateDto) {
    return apiClient.post<null>('/parking-rates', data);
  },

  update(id: string, data: UpdateParkingRateDto) {
    return apiClient.patch<null>(`/parking-rates/${id}`, data);
  },
};
