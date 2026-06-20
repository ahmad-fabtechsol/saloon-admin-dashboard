import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://salon-be-wine.vercel.app/v1';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  const status = result.error?.status;

  // Only force a logout when an *authenticated* session actually expires.
  // Never reset state on the login request itself — a failed login legitimately
  // returns 401, and resetting mid-request strips the error of its server
  // payload so the real message ("Incorrect email or password") is lost.
  const isAuthenticated = Boolean(api.getState().auth?.token);
  if (isAuthenticated && (status === 401 || status === 403)) {
    api.dispatch(baseApi.util.resetApiState());
    api.dispatch({ type: 'auth/logout' });
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'User', 'Salon', 'Dashboard', 'Customer', 'Booking'],
  endpoints: () => ({}),
});
