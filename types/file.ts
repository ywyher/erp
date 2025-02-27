export interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

export type UploadProgress = Record<string, number>;
