export interface UserResponse {
  id: string;
  clerkUserId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface SyncUserRequest {
  email: string;
  name?: string;
  avatarUrl?: string;
}
