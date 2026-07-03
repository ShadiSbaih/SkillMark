export interface UserResponse {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface SyncUserRequest {
  clerkId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}
