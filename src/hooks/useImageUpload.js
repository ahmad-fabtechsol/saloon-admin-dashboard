import { useCallback } from 'react';
import {
  useInitiateUploadMutation,
  useGeneratePresignedUrlMutation,
  useCompleteUploadMutation,
} from '../store/uploadApiSlice';

const deriveKeyFromUrl = (url) => {
  if (!url) return undefined;
  try {
    return new URL(url).pathname.replace(/^\//, '');
  } catch {
    return undefined;
  }
};

/**
 * Drives the 4-step multipart S3 upload pipeline (initiate → presign → PUT → complete).
 * Returns a stable `uploadImage(asset)` that resolves to `{ fileUrl, fileKey }`.
 *
 * @param {string} documentType — e.g. 'salon_photos', 'staff_profile'
 */
export default function useImageUpload(documentType) {
  const [initiateUpload] = useInitiateUploadMutation();
  const [generatePresignedUrl] = useGeneratePresignedUrlMutation();
  const [completeUpload] = useCompleteUploadMutation();

  const uploadImage = useCallback(
    async (asset) => {
      const fileName = asset.fileName || `${documentType}_${Date.now()}.jpg`;
      const filetype = asset.type || 'image/jpeg';
      const fileSize = asset.fileSize || 0;

      const initiateRes = await initiateUpload({
        fileName,
        fileSize,
        filetype,
        documentType,
      }).unwrap();
      const { uploadId } = initiateRes.data ?? initiateRes;

      const presignedRes = await generatePresignedUrl({
        uploadId,
        partNumber: 1,
        numChunks: 1,
        fileName,
        filetype,
      }).unwrap();
      const presignedUrl = (presignedRes.data ?? presignedRes).presignedUrls[0].url;

      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = () => reject(new Error('Failed to read local file'));
        xhr.responseType = 'blob';
        xhr.open('GET', asset.uri, true);
        xhr.send();
      });

      const s3Res = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': filetype },
        body: blob,
      });
      if (!s3Res.ok) throw new Error(`S3 upload failed with status ${s3Res.status}`);
      const eTag = (s3Res.headers.get('ETag') || s3Res.headers.get('etag') || '').replace(/"/g, '');

      const completeRes = await completeUpload({
        uploadId,
        fileName,
        parts: [{ partNumber: 1, eTag }],
      }).unwrap();

      const data = completeRes.data ?? completeRes;
      const fileUrl = completeRes.Location || data.fileUrl || data.location;
      const fileKey = data.key || data.fileKey || data.Key || deriveKeyFromUrl(fileUrl);

      return { fileUrl, fileKey };
    },
    [documentType, initiateUpload, generatePresignedUrl, completeUpload],
  );

  return { uploadImage };
}
