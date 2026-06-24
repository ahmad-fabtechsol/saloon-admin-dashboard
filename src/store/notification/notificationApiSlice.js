import { baseApi } from '../apiSlice';

const LIST = { type: 'Notification', id: 'LIST' };
const UNREAD = { type: 'Notification', id: 'UNREAD' };

// Mutations touch both the "all" and "unread" caches, so invalidate both.
const ALL_TAGS = [LIST, UNREAD];

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /notifications?page=&limit=
    getNotifications: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/notifications?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: [LIST],
    }),

    // GET /notifications/unread?page=&limit=
    getUnreadNotifications: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/notifications/unread?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: [UNREAD],
    }),

    // PATCH /notifications/{notificationId}/read
    markNotificationRead: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ALL_TAGS,
    }),

    // PATCH /notifications/read-all
    markAllNotificationsRead: builder.mutation({
      query: () => ({ url: '/notifications/read-all', method: 'PATCH' }),
      invalidatesTags: ALL_TAGS,
    }),

    // DELETE /notifications  — clears all notifications
    deleteAllNotifications: builder.mutation({
      query: () => ({ url: '/notifications', method: 'DELETE' }),
      invalidatesTags: ALL_TAGS,
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteAllNotificationsMutation,
} = notificationApi;
