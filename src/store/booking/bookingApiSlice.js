import { baseApi } from '../apiSlice';

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query({
      query: ({ page = 1, limit = 10, search, status } = {}) => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (search) params.set('search', search);
        if (status) params.set('status', status);

        return {
          url: `/bookings/my?${params.toString()}`,
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
  }),
});

export const { useGetBookingsQuery } = bookingApi;
