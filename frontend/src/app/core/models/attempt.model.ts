export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED' | 'CANCELLED';

export interface StartAttemptResponse {
  attemptId: string;
  quizId: string;
  attemptNumber: number;
  status: AttemptStatus;
  startedAt: string;
  expiresAt: string;
}

export interface AttemptResponse {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  userId: string;
  attemptNumber: number;
  expiresAt: string;
  totalPoints: number;
  earnedPoints: number;
  scorePercentage: number;
  passed: boolean;
  status: AttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  certificateIssued: boolean;
  certificateId: string | null;
}

export interface AttemptResultResponse {
  attemptId: string;
  totalPoints: number;
  earnedPoints: number;
  scorePercentage: number;
  passed: boolean;
  status: AttemptStatus;
  submittedAt: string;
  certificateIssued: boolean;
  certificateId: string | null;
}

export interface SubmitAnswerRequest {
  questionId: string;
  selectedOptionId: string;
}

export interface SubmitAttemptRequest {
  answers: SubmitAnswerRequest[];
}
