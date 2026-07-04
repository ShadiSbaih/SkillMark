export interface CloudinarySignatureRequest {
  organizationId: string;
  programId: string;
  params?: Record<string, string>;
}

export interface CloudinarySignatureResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  signedParams: Record<string, string>;
}
