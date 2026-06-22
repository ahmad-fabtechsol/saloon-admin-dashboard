import { baseApi } from '../apiSlice';
import { dashboardApi } from '../dashboard/dashboardApiSlice';

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /bookings/admin?page=&limit=&search=&status=&startDate=&endDate=
    getBookings: builder.query({
      query: ({ page = 1, limit = 10, search, status, startDate, endDate } = {}) => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (search) params.set('search', search);
        if (status) params.set('status', status);
        // Date range is inclusive; both are expected as YYYY-MM-DD strings.
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);

        return {
          url: `/bookings/admin?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: (result) => {
        const bookings = result?.results ?? result?.data?.results ?? result?.data?.bookings ?? result?.bookings;
        return bookings
          ? [
              ...bookings.map((booking) => ({ type: 'Booking', id: booking._id ?? booking.id })),
              { type: 'Booking', id: 'LIST' },
            ]
          : [{ type: 'Booking', id: 'LIST' }];
      },
    }),

    // GET /bookings/admin/export?status=&startDate=&endDate= → CSV file (blob)
    exportBookings: builder.mutation({
      query: ({ status, startDate, endDate } = {}) => {
        const params = new URLSearchParams();
        if (status) params.set('status', status);
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);

        const qs = params.toString();
        return {
          url: `/bookings/admin/export${qs ? `?${qs}` : ''}`,
          method: 'GET',
          responseHandler: (response) => response.blob(),
          cache: 'no-cache',
        };
      },
    }),

    // GET /bookings/admin/{bookingId}
    getBookingById: builder.query({
      query: (bookingId) => ({
        url: `/bookings/admin/${bookingId}`,
        method: 'GET',
      }),
      providesTags: (result, error, bookingId) => [{ type: 'Booking', id: bookingId }],
    }),

    // PATCH /bookings/admin/{bookingId}/status — status ∈ [confirmed, completed, cancelled, noShow]
    updateBookingStatus: builder.mutation({
      query: ({ bookingId, status }) => ({
        url: `/bookings/admin/${bookingId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        // Booking status changes affect dashboard stats (bookings/no-shows today).
        dispatch(
          dashboardApi.endpoints.getAdminDashboard.initiate(
            { activityLimit: 10, activityPage: 1, pendingLimit: 5 },
            { forceRefetch: true, subscribe: false }
          )
        );
      },
      // Refetch the affected booking, the listing, and the dashboard.
      invalidatesTags: (result, error, { bookingId }) => [
        { type: 'Booking', id: bookingId },
        { type: 'Booking', id: 'LIST' },
        { type: 'Dashboard', id: 'ADMIN' },
      ],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useExportBookingsMutation,
  useGetBookingByIdQuery,
  useUpdateBookingStatusMutation,
} = bookingApi;
