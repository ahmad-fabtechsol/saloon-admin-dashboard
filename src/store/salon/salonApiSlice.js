import { baseApi } from '../apiSlice';

export const salonApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /salons/admin/listings?page=&limit=&status=&submissionStatus=submitted
    getSalons: builder.query({
      query: ({ page = 1, limit = 10, status, submissionStatus = 'submitted' } = {}) => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        // `status` is omitted for the "All" tab so the API returns every status.
        if (status) params.set('status', status);
        if (submissionStatus) params.set('submissionStatus', submissionStatus);
        return { url: `/salons/admin/listings?${params.toString()}`, method: 'GET' };
      },
      // Tag every row + a LIST tag so mutations can invalidate the whole listing.
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map((s) => ({ type: 'Salon', id: s._id })),
              { type: 'Salon', id: 'LIST' },
            ]
          : [{ type: 'Salon', id: 'LIST' }],
    }),

    // GET /salons/admin/listings/{salonId}
    getSalonById: builder.query({
      query: (salonId) => ({
        url: `/salons/admin/listings/${salonId}`,
        method: 'GET',
      }),
      providesTags: (result, error, salonId) => [{ type: 'Salon', id: salonId }],
    }),

    // PATCH /salons/admin/{salonId}/status  — status ∈ [approved, rejected, suspended]
    // `rejectionReason` is sent only when status is "rejected".
    updateSalonStatus: builder.mutation({
      query: ({ salonId, status, rejectionReason }) => ({
        url: `/salons/admin/${salonId}/status`,
        method: 'PATCH',
        body: rejectionReason ? { status, rejectionReason } : { status },
      }),
      // Refetch the listing (and the affected row) once the status changes.
      invalidatesTags: (result, error, { salonId }) => [
        { type: 'Salon', id: salonId },
        { type: 'Salon', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetSalonsQuery,
  useGetSalonByIdQuery,
  useUpdateSalonStatusMutation,
} = salonApi;
