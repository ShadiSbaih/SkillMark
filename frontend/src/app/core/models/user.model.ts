export type UserRole = 'ADMIN' | 'STUDENT';

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  role: UserRole;
  createdAt: string;
}

export interface UpdateUserProfileRequest {
  email: string;
  name?: string;
  avatarUrl?: string;
}
