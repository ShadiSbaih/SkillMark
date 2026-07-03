export type ResourceType = 'LINK' | 'FILE' | 'IMAGE' | 'VIDEO_LINK';
export type ResourceStatus = 'ACTIVE' | 'HIDDEN' | 'REMOVED';
export type StorageProvider = 'R2' | 'CLOUDINARY' | 'EXTERNAL';

export interface ResourceResponse {
  id: string;
  programId: string;
  title: string;
  description: string | null;
  type: ResourceType;
  url: string | null;
  storageProvider: StorageProvider | null;
  objectKey: string | null;
  visibleToParticipants: boolean;
  status: ResourceStatus;
  position: number;
  createdAt: string;
}

export interface CreateResourceRequest {
  title: string;
  description?: string;
  type: ResourceType;
  url?: string;
  storageProvider?: StorageProvider;
  objectKey?: string;
  position?: number;
}

export interface UpdateResourceVisibilityRequest {
  visibleToParticipants: boolean;
}
