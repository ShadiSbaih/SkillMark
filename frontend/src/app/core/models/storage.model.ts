export interface R2UploadUrlRequest {
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface R2UploadUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  storageKey: string;
}
