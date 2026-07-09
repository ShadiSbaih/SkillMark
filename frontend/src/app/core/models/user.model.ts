export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface UpdateUserProfileRequest {
  email: string;
  name?: string;
  avatarUrl?: string;
}
