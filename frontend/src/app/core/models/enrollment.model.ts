export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'REMOVED';

export interface Enrollment {
  id: string;
  programId: string;
  userId: string;
  userName: string;
  status: EnrollmentStatus;
  enrolledAt: string;
}

export interface CreateEnrollmentRequest {
  userId: string;
}
