import { baseApi } from '../apiSlice';
import { dashboardApi } from '../dashboard/dashboardApiSlice';

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

    // GET /salons/admin/pending-approvals?page=&limit=
    // Returns salons that have pending changes and/or services awaiting review.
    // Same paginated envelope as the listings endpoint: { results, totalPages, totalResults }.
    getPendingApprovals: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        return { url: `/salons/admin/pending-approvals?${params.toString()}`, method: 'GET' };
      },
      // Tolerate the different envelopes a backend might use for the list body.
      transformResponse: (response) => {
        const results =
          response?.results ?? response?.data ?? response?.docs ?? response?.salons ?? [];
        return {
          results: Array.isArray(results) ? results : [],
          totalPages: response?.totalPages ?? response?.totalPage ?? 1,
          totalResults: response?.totalResults ?? response?.totalResult ?? results.length ?? 0,
        };
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map((s) => ({ type: 'Salon', id: s._id })),
              { type: 'Salon', id: 'PENDING' },
            ]
          : [{ type: 'Salon', id: 'PENDING' }],
    }),

    // PATCH /salons/admin/{salonId}/pending-changes  — action ∈ [approve, reject]
    // `rejectionReason` is sent only when rejecting.
    reviewPendingChanges: builder.mutation({
      query: ({ salonId, action, rejectionReason }) => ({
        url: `/salons/admin/${salonId}/pending-changes`,
        method: 'PATCH',
        body: action === 'reject' ? { action, rejectionReason } : { action },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(
          dashboardApi.endpoints.getAdminDashboard.initiate(
            { activityLimit: 10, activityPage: 1, pendingLimit: 5 },
            { forceRefetch: true, subscribe: false }
          )
        );
      },
      invalidatesTags: (result, error, { salonId }) => [
        { type: 'Salon', id: salonId },
        { type: 'Salon', id: 'PENDING' },
        { type: 'Salon', id: 'LIST' },
        { type: 'Dashboard', id: 'ADMIN' },
      ],
    }),

    // PATCH /salons/admin/services/{serviceId}/review  — action ∈ [approve, reject]
    // `rejectionReason` is sent only when rejecting.
    reviewService: builder.mutation({
      query: ({ serviceId, action, rejectionReason }) => ({
        url: `/salons/admin/services/${serviceId}/review`,
        method: 'PATCH',
        body: action === 'reject' ? { action, rejectionReason } : { action },
      }),
      invalidatesTags: [
        { type: 'Salon', id: 'PENDING' },
        { type: 'Dashboard', id: 'ADMIN' },
      ],
    }),

    // PATCH /salons/admin/{salonId}/status  — status ∈ [approved, rejected, suspended]
    // `rejectionReason` is sent only when status is "rejected".
    updateSalonStatus: builder.mutation({
      query: ({ salonId, status, rejectionReason }) => ({
        url: `/salons/admin/${salonId}/status`,
        method: 'PATCH',
        body: rejectionReason ? { status, rejectionReason } : { status },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(
          dashboardApi.endpoints.getAdminDashboard.initiate(
            { activityLimit: 10, activityPage: 1, pendingLimit: 5 },
            { forceRefetch: true, subscribe: false }
          )
        );
      },
      // Refetch the listing (and the affected row) once the status changes.
      invalidatesTags: (result, error, { salonId }) => [
        { type: 'Salon', id: salonId },
        { type: 'Salon', id: 'LIST' },
        { type: 'Dashboard', id: 'ADMIN' },
      ],
    }),
  }),
});

export const {
  useGetSalonsQuery,
  useGetSalonByIdQuery,
  useUpdateSalonStatusMutation,
  useGetPendingApprovalsQuery,
  useReviewPendingChangesMutation,
  useReviewServiceMutation,
} = salonApi;
