'use client';

import { useState } from 'react';
import { getPreSignedUrl } from '@/lib/s3';
import { computeSHA256 } from '@/app/actions';

export type UploadedFile = {
  file: File;
  url: string | null;
  progress: number;
  error: Error | null;
  name: string | null; // Add the name property
  type: string | null; // Add the name pr'use client'

  import { useState } from 'react';
  import { getPreSignedUrl } from '@/lib/s3';
  
  export function useUploadFile() {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<Error | null>(null);
  
    const uploadFile = async (file: File): Promise<string> => {
      setIsUploading(true);
      setProgress(0);
      setError(null);
  
      try {
        // Calculate SHA-256 checksum
        const hashHex = await computeSHA256();
  
        // Get the presigned URL using the server action
        const result = await getPreSignedUrl({
          type: file.type,
          size: file.size,
          checksum: hashHex,
        });
  
        if ('failure' in result) {
          throw new Error(result.failure?.message);
        }
  
        const { url, fileName } = result.success;
  
        // Upload the file to S3 using XMLHttpRequest for progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
  
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              setProgress(percentComplete);
            }
          });
  
          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });
  
          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
          });
  
          xhr.open('PUT', url);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.send(file);
        });
  
        // Construct the public URL (adjust according to your Cloudflare R2 setup)
        const publicUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.r2.cloudflarestorage.com/${fileName}`;
  
        return publicUrl;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        throw err;
      } finally {
        setIsUploading(false);
      }
    };
  
    return { uploadFile, isUploading, progress, error };
  }operty
};

export function useFileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (files: File[]) => {
    const initialFiles = files.map((file) => ({
      file,
      url: null,
      progress: 0,
      error: null,
      name: null,
      type: file.type,
    }));

    // Use functional update to ensure `uploadedFiles` is updated correctly
    setUploadedFiles((prev) => [...prev, ...initialFiles]);
    setIsUploading(true);

    await Promise.all(
      initialFiles.map(async (initialFile, index) => {
        const updateFileState = (updates: Partial<UploadedFile>) => {
          setUploadedFiles((prev) =>
            prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
          );
        };

        try {
          const hashHex = await computeSHA256(initialFile.file);

          const result = await getPreSignedUrl({
            type: initialFile.file.type,
            size: initialFile.file.size,
            checksum: hashHex,
          });

          if ('failure' in result) {
            throw new Error(result.failure?.message);
          }

          const { url, fileName } = result.success;

          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
              if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                updateFileState({ progress: percentComplete });
              }
            });

            xhr.addEventListener('load', () => {
              if (xhr.status === 200) {
                resolve();
              } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            });

            xhr.addEventListener('error', () => {
              reject(new Error('Upload failed'));
            });

            xhr.open('PUT', url);
            xhr.setRequestHeader('Content-Type', initialFile.file.type);
            xhr.send(initialFile.file);
          });

          const publicUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.r2.cloudflarestorage.com/${fileName}`;
          updateFileState({ url: publicUrl, progress: 100, name: fileName });
        } catch (error) {
          updateFileState({ error: error as Error, progress: 100 });
        }
      })
    );

    setIsUploading(false);
  };

  return { uploadedFiles, isUploading, handleUpload };
}
