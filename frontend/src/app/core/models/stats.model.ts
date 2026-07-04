export interface OrganizationStatsResponse {
  totalPrograms: number;
  totalMembers: number;
  totalEnrolledParticipants: number;
  totalQuizzes: number;
  totalAttempts: number;
  totalCertificates: number;
  averageScore: number;
  passRate: number;
}

export interface ProgramStatsResponse {
  totalEnrollments: number;
  activeEnrollments: number;
  resourcesCount: number;
  quizzesCount: number;
  attemptsCount: number;
  passedParticipants: number;
  certificatesIssued: number;
  averageScore: number;
}

export interface QuizStatsResponse {
  attemptsCount: number;
  submittedAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passCount: number;
  failCount: number;
  passRate: number;
}
