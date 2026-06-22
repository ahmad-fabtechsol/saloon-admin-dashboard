import { baseApi } from './apiSlice';

const uploadApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    initiateUpload: builder.mutation({
      query: (body) => ({
        url: 'upload/initiate-upload',
        method: 'POST',
        body,
      }),
    }),
    generatePresignedUrl: builder.mutation({
      query: (body) => ({
        url: 'upload/generate-presigned-url',
        method: 'POST',
        body,
      }),
    }),
    completeUpload: builder.mutation({
      query: (body) => ({
        url: 'upload/complete-upload',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useInitiateUploadMutation,
  useGeneratePresignedUrlMutation,
  useCompleteUploadMutation,
} = uploadApiSlice;

export default uploadApiSlice;
