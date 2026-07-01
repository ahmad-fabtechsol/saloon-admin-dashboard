import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { notificationApi } from '@/store/notification/notificationApiSlice';

const NOTIFICATION_TAGS = [
  { type: 'Notification', id: 'LIST' },
  { type: 'Notification', id: 'UNREAD' },
];

/**
 * Connects the global socket while authenticated + online and listens for the
 * server's "new-notification" event. On each event it invalidates the
 * notification caches so the navbar bell and the Notifications page refetch
 * (showing both existing and the newly-arrived notifications) and surfaces a
 * toast.
 *
 * Mount once in the authenticated shell (AppHeader).
 *
 * @param {string|null} token  the auth token; the socket reconnects on change
 */
export function useNotificationSocket(token) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }

    const handleNewNotification = (data) => {
      // Server payload: { success: true, notification: {...} }
      const notification = data?.notification ?? data;
      dispatch(notificationApi.util.invalidateTags(NOTIFICATION_TAGS));
      const message =
        notification?.title ??
        notification?.message ??
        notification?.body ??
        'You have a new notification';
      toast(message, {
        description: notification?.title ? notification?.message : undefined,
      });
    };

    const bind = () => {
      // The server accepts a bare or "Bearer "-prefixed token in the handshake.
      const socket = connectSocket(`Bearer ${token}`);
      if (!socket) return;
      // Re-bind defensively so we never stack duplicate listeners.
      socket.off('new-notification', handleNewNotification);
      socket.on('new-notification', handleNewNotification);
    };

    // Connect now if we're online; (re)connect when connectivity returns.
    if (typeof navigator === 'undefined' || navigator.onLine) bind();

    const handleOnline = () => bind();
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
      getSocket()?.off('new-notification', handleNewNotification);
    };
  }, [token, dispatch]);
}
