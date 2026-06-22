import { baseApi } from '../apiSlice';

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /reports/admin?from=&to=&search=&topSalonsLimit=
    getAdminReports: builder.query({
      query: ({ from, to, search, topSalonsLimit } = {}) => {
        const params = new URLSearchParams();
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        if (search) params.set('search', search);
        if (topSalonsLimit) params.set('topSalonsLimit', String(topSalonsLimit));

        const qs = params.toString();
        return {
          url: `/reports/admin${qs ? `?${qs}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: [{ type: 'Report', id: 'ADMIN' }],
    }),
  }),
});

export const { useGetAdminReportsQuery } = reportsApi;
