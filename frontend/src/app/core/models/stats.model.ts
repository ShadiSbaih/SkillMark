export interface OrganizationStatsResponse {
  organizationId: string;
  programCount: number;
  memberCount: number;
  enrollmentCount: number;
  quizCount: number;
  certificateCount: number;
  averageScore: number;
  passRate: number;
}

export interface ProgramStatsResponse {
  programId: string;
  enrollmentCount: number;
  resourceCount: number;
  quizCount: number;
  certificateCount: number;
  averageScore: number;
  passRate: number;
}

export interface QuizStatsResponse {
  quizId: string;
  attemptCount: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passCount: number;
  failCount: number;
  passRate: number;
}
