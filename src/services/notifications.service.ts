import { apiClient, getAuthToken } from '@/lib/api-client';
import {
  ListNotificationQueryParams,
  ListNotificationResponse,
  UnreadCountResponse,
  NotificationItem,
} from '@/types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export const notificationsService = {
  getList(params?: ListNotificationQueryParams) {
    return apiClient.get<ListNotificationResponse>('/notifications/list', params);
  },

  getUnreadCount() {
    return apiClient.get<UnreadCountResponse>('/notifications/unread-count');
  },

  markAsRead(id: string) {
    return apiClient.patch<null>(`/notifications/${id}/read`);
  },

  markAllAsRead() {
    return apiClient.patch<null>('/notifications/read-all');
  },

  subscribeStream(
    onMessage: (notification: NotificationItem) => void,
    onError?: (error: Event) => void
  ): () => void {
    if (typeof window === 'undefined') return () => {};

    const token = getAuthToken();
    const streamUrl = `${BASE_URL}/notifications/stream${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    const eventSource = new EventSource(streamUrl, { withCredentials: true });

    eventSource.onmessage = (event) => {
      try {
        const data: NotificationItem = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error('Failed to parse SSE notification payload:', err);
      }
    };

    if (onError) {
      eventSource.onerror = (err) => {
        onError(err);
      };
    }

    return () => {
      eventSource.close();
    };
  },
};
