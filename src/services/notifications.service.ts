import { fetchEventSource } from '@microsoft/fetch-event-source';
import { apiClient, getAuthToken } from '@/lib/api-client';
import {
  ListNotificationQueryParams,
  ListNotificationResponse,
  UnreadCountResponse,
  NotificationItem,
  SSEEventEnvelope,
  SSENotificationPayload,
} from '@/types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

/** Maximum number of automatic reconnection attempts before giving up. */
const MAX_RETRY_ATTEMPTS = 5;

/** Base delay in milliseconds for exponential backoff (doubles each retry). */
const BASE_RETRY_DELAY_MS = 1000;

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

  /**
   * Subscribe to the real-time SSE notification stream.
   *
   * Uses `@microsoft/fetch-event-source` which supports custom headers
   * (required for Bearer token auth through the BFF proxy). The native
   * browser EventSource API does not support custom headers, which is
   * why this library is necessary.
   *
   * @param onMessage - Callback invoked for each incoming notification event.
   * @param onError   - Optional callback invoked when a connection error occurs.
   * @returns An unsubscribe function that aborts the SSE connection.
   */
  subscribeStream(
    onMessage: (notification: NotificationItem) => void,
    onError?: (error: any) => void
  ): () => void {
    if (typeof window === 'undefined') return () => {};

    const ctrl = new AbortController();
    let retryCount = 0;

    const connect = () => {
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
        // Keep connection alive even when the browser tab is in the background.
        // Without this, the browser may throttle or close the connection.
        openWhenHidden: true,

        async onopen(response) {
          if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
            // Connection successfully established — reset retry counter
            retryCount = 0;
            return;
          }

          if (response.status === 401 || response.status === 403) {
            // Auth failure — do not retry, let the app handle session expiry
            throw new Error(`SSE authentication failed with status: ${response.status}`);
          }

          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            // Fatal client error — do not retry
            throw new Error(`Fatal SSE connection error with status: ${response.status}`);
          }

          // For 5xx or 429 errors, fetchEventSource will auto-retry via onerror
        },

        onmessage(event) {
          if (!event.data) return;
          try {
            const envelope: SSEEventEnvelope = JSON.parse(event.data);

            // Silently skip heartbeat keep-alive pings
            if (envelope.type !== 'notification') return;

            // Extract the inner notification payload from the envelope
            const payload = envelope.data as SSENotificationPayload;

            // Map the SSE payload to a NotificationItem-compatible shape
            // so existing UI components can consume it without changes.
            const notification: NotificationItem = {
              id: crypto.randomUUID(),
              title: payload.title,
              message: payload.message,
              type: payload.type,
              is_read: false,
              meta: {
                reference_type: payload.reference_type,
                reference_id: payload.reference_id,
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            onMessage(notification);
          } catch (err) {
            console.error('Failed to parse SSE notification payload:', err);
          }
        },

        onerror(err) {
          console.warn('SSE notification stream error:', err);

          if (ctrl.signal.aborted) {
            // Component unmounted — stop retrying by re-throwing
            throw err;
          }

          retryCount++;
          if (retryCount > MAX_RETRY_ATTEMPTS) {
            console.error(`SSE exceeded max retry attempts (${MAX_RETRY_ATTEMPTS}). Giving up.`);
            if (onError) {
              onError(err);
            }
            // Re-throw to stop fetchEventSource from retrying indefinitely
            throw err;
          }

          // Exponential backoff: 1s → 2s → 4s → 8s → 16s
          const delay = BASE_RETRY_DELAY_MS * Math.pow(2, retryCount - 1);
          console.info(`SSE reconnecting in ${delay}ms (attempt ${retryCount}/${MAX_RETRY_ATTEMPTS})...`);
          return delay;
        },
      }).catch((err) => {
        // Silently ignore abort errors when component unmounts
        if (ctrl.signal.aborted) return;
        console.error('SSE fetchEventSource connection error:', err);
      });
    };

    connect();

    return () => {
      ctrl.abort();
    };
  },
};
