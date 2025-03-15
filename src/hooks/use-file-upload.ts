import { getFileUrl } from "@/lib/funcs";
import { useState } from "react";
import { toast } from "sonner";
import { UploadedFile } from "types/file";

async function computeSHA256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

export function useFileUpload() {
  const [progresses, setProgresses] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);

  const getPreSignedUrl = async (
    type: string,
    size: number,
    checksum: string,
  ) => {
    const response = await fetch(
      "http://localhost:3000/api/upload/get-presigned-url",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, size, checksum }),
      },
    );

    if (!response.ok) {
      // Extract error info from response
      const errorData = await response.json().catch(() => ({ message: "Unknown error occurred" }));
      const errorMessage = errorData.message || `Request failed with status: ${response.status}`;
      
      // Show toast error
      toast.error(errorMessage);
      
      // Throw error to stop execution
      throw new Error(errorMessage);
    }

    return response.json() as Promise<UploadedFile>;
  };

  const handleUpload = async (file: File): Promise<UploadedFile & { error?: string }> => {
    setIsUploading(true);

    try {
      const checksum = await computeSHA256(file);

      const { url, name, size, key, type } = await getPreSignedUrl(
        file.type,
        file.size,
        checksum,
      );

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setProgresses((prev) => ({ ...prev, [file.name]: percentComplete }));
        }
      };

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            setProgresses((prev) => ({ ...prev, [file.name]: 100 }));
            resolve();
          } else {
            const errorMessage = `Upload failed with status ${xhr.status}`;
            toast.error(errorMessage);
            reject(new Error(errorMessage));
          }
        };
        xhr.onerror = () => {
          const errorMessage = "Network error occurred during upload";
          toast.error(errorMessage);
          reject(new Error(errorMessage));
        };
        xhr.send(file);
      });

      return {
        key,    
        url: getFileUrl(name),
        name,   
        size,
        type,   
      };
    } catch (error: any) {
      // Error will already be shown via toast in the catch blocks above
      // We just need to return the error data
      return {
        key: '',
        url: '',
        name: file.name,
        size: file.size,
        type: file.type,
        error: error.message || "Failed to upload file"
      };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    handleUpload,
    progresses, // if uploading multiple files
    isUploading,
    setProgresses,
    setIsUploading,
  };
}