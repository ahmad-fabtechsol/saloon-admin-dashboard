import { baseApi } from '../apiSlice';

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: ({ page = 1, limit = 10, search, status } = {}) => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (search) params.set('search', search);
        if (status) params.set('status', status);

        return {
          url: `/users/admin/customers?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: (result) => {
        const customers = result?.results ?? result?.data?.results ?? result?.data?.customers ?? result?.customers
        return customers
          ? [
              ...customers.map((customer) => ({ type: 'Customer', id: customer._id ?? customer.id })),
              { type: 'Customer', id: 'LIST' },
            ]
          : [{ type: 'Customer', id: 'LIST' }];
      },
    }),

    updateCustomerStatus: builder.mutation({
      query: ({ customerId, status }) => ({
        url: `/users/admin/customers/${customerId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { customerId }) => [
        { type: 'Customer', id: customerId },
        { type: 'Customer', id: 'LIST' },
      ],
    }),
  }),
});

export const { useGetCustomersQuery, useUpdateCustomerStatusMutation } = customerApi;
