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

    // GET /users/me — current admin profile
    getMe: builder.query({
      query: () => ({
        url: 'users/me',
        method: 'GET',
      }),
      providesTags: [{ type: 'User', id: 'ME' }],
    }),

    // PATCH /users/me — { name, contact, profilePicture }
    updateProfile: builder.mutation({
      query: (body) => ({
        url: 'users/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [{ type: 'User', id: 'ME' }],
    }),
  }),
});

export const {
  useLazyGetLoginUserQuery,
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateProfileMutation,
} = adminApi;
