export interface UploadedFile {
  key: string;    // Unique identifier
  url: string;    // Public URL of the uploaded file
  name: string;   // Original filename
  size: number;   // File size in bytes
  type: string;   // MIME type
}