export type QuizStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type QuestionType = 'SINGLE_CHOICE';
export type CertificateIssueMode = 'AUTO' | 'MANUAL' | 'NONE';

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  position: number;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  points: number;
  position: number;
  options: Option[];
}

export interface Quiz {
  id: string;
  programId: string;
  title: string;
  description?: string;
  instructions?: string;
  passingScore: number;
  durationMinutes: number;
  maxAttempts: number;
  certificateEnabled: boolean;
  certificateIssueMode: CertificateIssueMode;
  visibleToParticipants: boolean;
  isPublished: boolean;
  status: QuizStatus;
  createdAt: string;
  questions: Question[];
}

export interface CreateQuizRequest {
  title: string;
  description?: string;
  passingScore: number;
  durationMinutes: number;
  maxAttempts: number;
  certificateEnabled?: boolean;
  certificateIssueMode?: CertificateIssueMode;
}

export interface UpdateQuizRequest {
  title: string;
  description?: string;
  instructions?: string;
  passingScore: number;
  durationMinutes: number;
  maxAttempts: number;
  certificateEnabled?: boolean;
  certificateIssueMode?: CertificateIssueMode;
}

export interface CreateQuestionRequest {
  text: string;
  type: QuestionType;
  points: number;
  position: number;
  options: CreateOptionRequest[];
}

export interface CreateOptionRequest {
  text: string;
  isCorrect: boolean;
  position: number;
}
