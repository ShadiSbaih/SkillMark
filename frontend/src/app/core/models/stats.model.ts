export interface OrganizationStatsResponse {
  totalPrograms: number;
  totalMembers: number;
  totalEnrolledParticipants: number;
  totalQuizzes: number;
  totalAttempts: number;
  totalCertificates: number;
  averageScore: number;
  passRate: number;
  topPrograms: TopProgramResponse[];
}

export interface TopProgramResponse {
  programId: string;
  programTitle: string;
  enrollments: number;
  certificatesIssued: number;
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

export interface QuizQuestionStatsResponse {
  questionId: string;
  questionText: string;
  position: number;
  points: number;
  totalAttempts: number;
  correctCount: number;
  incorrectCount: number;
  correctRate: number;
}

export interface QuizScoreDistributionResponse {
  buckets: ScoreDistributionBucket[];
}

export interface ScoreDistributionBucket {
  label: string;
  minScore: number;
  maxScore: number;
  count: number;
}

export interface QuizAttemptTimelineResponse {
  daily: TimelineBucket[];
  weekly: TimelineBucket[];
}

export interface TimelineBucket {
  label: string;
  started: number;
  submitted: number;
  passed: number;
}

export interface ProgramEnrollmentTimelineResponse {
  daily: EnrollmentTimelineBucket[];
  weekly: EnrollmentTimelineBucket[];
}

export interface EnrollmentTimelineBucket {
  label: string;
  total: number;
  active: number;
  completed: number;
}

export interface ProgramCompletionStatsResponse {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  attemptedQuizzes: number;
  passedQuizzes: number;
  certificatesIssued: number;
  enrollmentToAttemptRate: number;
  attemptToPassRate: number;
  enrollmentToCertificateRate: number;
}

export interface OrganizationCertificatesTimelineResponse {
  daily: CertificateTimelineBucket[];
  weekly: CertificateTimelineBucket[];
}

export interface CertificateTimelineBucket {
  label: string;
  issued: number;
  revoked: number;
}
