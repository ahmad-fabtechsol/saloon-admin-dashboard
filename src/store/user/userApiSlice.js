import { baseApi } from '../apiSlice';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLoginUser: builder.query({
      query: () => ({
        url: `users/getme/`,
        method: 'GET',
      }),
      providesTags: ['LoginUser'],
    }),
  }),
});

export const {
  useLazyGetLoginUserQuery,
} = adminApi;
