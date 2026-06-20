import { baseApi } from '../apiSlice';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query({
      query: ({ activityLimit = 10, activityPage = 1, pendingLimit = 5 } = {}) => {
        const params = new URLSearchParams();
        params.set('activityLimit', String(activityLimit));
        params.set('activityPage', String(activityPage));
        params.set('pendingLimit', String(pendingLimit));

        return {
          url: `/salons/admin/dashboard?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: [{ type: 'Dashboard', id: 'ADMIN' }],
    }),
  }),
});

export const { useGetAdminDashboardQuery } = dashboardApi;
