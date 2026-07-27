import { fetchEventSource } from '@microsoft/fetch-event-source';
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
    onError?: (error: any) => void
  ): () => void {
    if (typeof window === 'undefined') return () => {};

    const ctrl = new AbortController();
    const token = getAuthToken();
    const streamUrl = `${BASE_URL}/notifications/stream`;

    const headers: Record<string, string> = {
      'Accept': 'text/event-stream',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetchEventSource(streamUrl, {
      method: 'GET',
      headers,
      signal: ctrl.signal,
      async onopen(response) {
        if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
          return; // Connection successfully established
        } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw new Error(`Fatal SSE connection error with status: ${response.status}`);
        }
      },
      onmessage(event) {
        if (!event.data) return;
        try {
          const data: NotificationItem = JSON.parse(event.data);
          onMessage(data);
        } catch (err) {
          console.error('Failed to parse SSE notification payload:', err);
        }
      },
      onerror(err) {
        console.warn('SSE notification stream error:', err);
        if (onError) {
          onError(err);
        }
      },
    }).catch((err) => {
      // Prevent unhandled promise rejection when signal aborted
      if (ctrl.signal.aborted) return;
      console.error('SSE fetchEventSource connection error:', err);
    });

    return () => {
      ctrl.abort();
    };
  },
};
