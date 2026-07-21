import { apiClient } from '@/lib/api-client';
import {
  PresignUploadDto,
  PresignUploadResponse,
  DirectUploadResponse,
} from '@/types/api';

export const uploadService = {
  presign(data: PresignUploadDto) {
    return apiClient.post<PresignUploadResponse>('/upload/presign', data);
  },

  direct(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.put<DirectUploadResponse>('/upload/direct', formData, {
      headers: {}, // fetch will set multipart/form-data boundary automatically
    });
  },
};
