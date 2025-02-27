import { useState } from "react";

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

    console.log(response);

    if (!response.ok) {
      throw new Error("Failed to get pre-signed URL");
    }

    return response.json();
  };

  const handleUpload = async (file: File): Promise<string | null> => {
    setIsUploading(true);

    try {
      const checksum = await computeSHA256(file);

      const { url, fileName } = await getPreSignedUrl(
        file.type,
        file.size,
        checksum,
      );

      console.log(url, fileName);

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
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(file);
      });

      return fileName;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    handleUpload,
    progresses,
    isUploading,
    setProgresses,
    setIsUploading,
  };
}
