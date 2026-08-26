export interface CloudinarySignatureRequest {
  folder?: string;
  publicId?: string;
}

export interface CloudinarySignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
}
