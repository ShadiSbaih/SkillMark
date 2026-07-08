export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'REMOVED';

export interface Enrollment {
  id: string;
  programId: string;
  userId: string;
  userName: string;
  userEmail?: string | null;
  userAvatarUrl?: string | null;
  status: EnrollmentStatus;
  enrolledAt: string;
}

export interface CreateEnrollmentRequest {
  userId: string;
}
