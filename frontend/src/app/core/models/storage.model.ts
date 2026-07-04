export interface R2UploadUrlRequest {
  programId: string;
  objectKey: string;
  contentType?: string;
}

export interface R2UploadUrlResponse {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  expiresAt: string;
}
