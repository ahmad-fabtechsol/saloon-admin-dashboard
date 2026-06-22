import { baseApi } from '../apiSlice';

export const feedbackApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /feedback/admin/stats
    getFeedbackStats: builder.query({
      query: () => ({ url: '/feedback/admin/stats', method: 'GET' }),
      providesTags: [{ type: 'Feedback', id: 'STATS' }],
    }),

    // GET /feedback/admin?page=&limit=&type=&status=
    getFeedbacks: builder.query({
      query: ({ page = 1, limit = 10, type, status, search } = {}) => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (type) params.set('type', type);
        if (status) params.set('status', status);
        if (search) params.set('search', search);

        return { url: `/feedback/admin?${params.toString()}`, method: 'GET' };
      },
      providesTags: (result) => {
        const items = result?.results ?? result?.data?.results ?? result?.data?.feedbacks ?? result?.feedbacks;
        return items
          ? [
              ...items.map((item) => ({ type: 'Feedback', id: item._id ?? item.id })),
              { type: 'Feedback', id: 'LIST' },
            ]
          : [{ type: 'Feedback', id: 'LIST' }];
      },
    }),

    // GET /feedback/admin/{feedbackId}
    getFeedbackById: builder.query({
      query: (feedbackId) => ({ url: `/feedback/admin/${feedbackId}`, method: 'GET' }),
      providesTags: (result, error, feedbackId) => [{ type: 'Feedback', id: feedbackId }],
    }),

    // PATCH /feedback/admin/{feedbackId} — { status?, priority?, adminNote?, adminResponse? }
    updateFeedback: builder.mutation({
      query: ({ feedbackId, ...body }) => ({
        url: `/feedback/admin/${feedbackId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { feedbackId }) => [
        { type: 'Feedback', id: feedbackId },
        { type: 'Feedback', id: 'LIST' },
        { type: 'Feedback', id: 'STATS' },
      ],
    }),

    // DELETE /feedback/admin/{feedbackId}
    deleteFeedback: builder.mutation({
      query: (feedbackId) => ({
        url: `/feedback/admin/${feedbackId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, feedbackId) => [
        { type: 'Feedback', id: feedbackId },
        { type: 'Feedback', id: 'LIST' },
        { type: 'Feedback', id: 'STATS' },
      ],
    }),
  }),
});

export const {
  useGetFeedbackStatsQuery,
  useGetFeedbacksQuery,
  useGetFeedbackByIdQuery,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,
} = feedbackApi;
