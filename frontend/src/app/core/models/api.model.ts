export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  errors?: string[];
  path?: string;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type Uuid = string;

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DISABLED' | 'DELETED';
export type OrganizationStatus = 'ACTIVE' | 'DISABLED' | 'DELETED';
export type MembershipRole = 'OWNER' | 'PARTICIPANT';
export type MembershipStatus = 'ACTIVE' | 'INACTIVE' | 'REMOVED';
export type ProgramStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type InvitationStatus = 'ACTIVE' | 'DISABLED' | 'EXPIRED';
export type ResourceType = 'LINK' | 'FILE' | 'IMAGE' | 'VIDEO_LINK';
export type ResourceStatus = 'ACTIVE' | 'ARCHIVED' | 'DELETED';
export type StorageProvider = 'EXTERNAL' | 'R2' | 'CLOUDINARY';
export type QuizStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type QuestionType = 'SINGLE_CHOICE';
export type CertificateIssueMode = 'AUTO' | 'MANUAL' | 'NONE';
export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED' | 'CANCELLED';
export type CertificateStatus = 'ACTIVE' | 'REVOKED';
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'REMOVED';

export interface UserResponse {
  id: Uuid;
  clerkUserId: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  status: UserStatus;
  createdAt: string;
}

export interface SyncUserRequest {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
}

export interface OrganizationResponse {
  id: Uuid;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  ownerId: Uuid;
  status: OrganizationStatus;
  createdAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
  description?: string | null;
  logoUrl?: string | null;
}

export type UpdateOrganizationRequest = CreateOrganizationRequest;

export interface MembershipResponse {
  id: Uuid;
  organizationId: Uuid;
  userId: Uuid;
  userName: string;
  userEmail: string;
  role: MembershipRole;
  status: MembershipStatus;
  invitedBy?: Uuid | null;
  joinedAt?: string | null;
  removedBy?: Uuid | null;
  removedAt?: string | null;
  createdAt: string;
}

export interface AddMemberRequest {
  userId: Uuid;
  role: MembershipRole;
}

export interface ProgramResponse {
  id: Uuid;
  organizationId: Uuid;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  status: ProgramStatus;
  isPublished: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
}

export interface CreateProgramRequest {
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export type UpdateProgramRequest = CreateProgramRequest;

export interface InvitationResponse {
  id: Uuid;
  organizationId: Uuid;
  programId: Uuid;
  code: string;
  description?: string | null;
  maxUses?: number | null;
  usedCount: number;
  expiresAt?: string | null;
  status: InvitationStatus;
  disabledAt?: string | null;
  createdAt: string;
}

export interface CreateInvitationRequest {
  description?: string | null;
  maxUses?: number | null;
  expiresAt?: string | null;
}

export interface EnrollmentResponse {
  id: Uuid;
  programId: Uuid;
  userId: Uuid;
  userName: string;
  status: EnrollmentStatus;
  enrolledAt: string;
}

export interface CreateEnrollmentRequest {
  userId: Uuid;
}

export interface ResourceResponse {
  id: Uuid;
  programId: Uuid;
  title: string;
  description?: string | null;
  type: ResourceType;
  url: string;
  storageProvider: StorageProvider;
  objectKey?: string | null;
  status: ResourceStatus;
  position: number;
  createdAt: string;
}

export interface CreateResourceRequest {
  title: string;
  description?: string | null;
  type: ResourceType;
  url: string;
  storageProvider: StorageProvider;
  objectKey?: string | null;
  position: number;
}

export interface OptionResponse {
  id: Uuid;
  text: string;
  isCorrect: boolean;
  position: number;
}

export interface CreateOptionRequest {
  text: string;
  isCorrect: boolean;
  position: number;
}

export interface QuestionResponse {
  id: Uuid;
  text: string;
  type: QuestionType;
  points: number;
  position: number;
  options: OptionResponse[];
}

export interface CreateQuestionRequest {
  text: string;
  type: QuestionType;
  points: number;
  position: number;
  options: CreateOptionRequest[];
}

export interface QuizResponse {
  id: Uuid;
  programId: Uuid;
  organizationId: Uuid;
  title: string;
  description?: string | null;
  passingScore: number;
  durationMinutes: number;
  maxAttempts: number;
  certificateEnabled: boolean;
  certificateIssueMode: CertificateIssueMode;
  isPublished: boolean;
  status: QuizStatus;
  createdAt: string;
  questions: QuestionResponse[];
}

export interface CreateQuizRequest {
  title: string;
  description?: string | null;
  passingScore: number;
  durationMinutes: number;
  maxAttempts: number;
  certificateEnabled?: boolean;
  certificateIssueMode?: CertificateIssueMode;
}

export type UpdateQuizRequest = CreateQuizRequest;

export interface StartAttemptResponse {
  attemptId: Uuid;
  quizId: Uuid;
  attemptNumber: number;
  status: AttemptStatus;
  startedAt: string;
  expiresAt: string;
}

export interface AttemptResponse {
  attemptId: Uuid;
  quizId: Uuid;
  userId: Uuid;
  attemptNumber: number;
  expiresAt?: string | null;
  totalPoints?: number | null;
  earnedPoints?: number | null;
  scorePercentage?: number | null;
  passed?: boolean | null;
  status: AttemptStatus;
  startedAt: string;
  submittedAt?: string | null;
}

export interface SubmitAnswerRequest {
  questionId: Uuid;
  selectedOptionId: Uuid;
}

export interface SubmitAttemptRequest {
  answers: SubmitAnswerRequest[];
}

export interface AttemptResultResponse {
  attemptId: Uuid;
  totalPoints: number;
  earnedPoints: number;
  scorePercentage: number;
  passed: boolean;
  status: AttemptStatus;
  submittedAt: string;
  certificateIssued: boolean;
  certificateId?: Uuid | null;
}

export interface CertificateResponse {
  id: Uuid;
  certificateNumber: string;
  verificationCode: string;
  organizationId: Uuid;
  programId: Uuid;
  quizId: Uuid;
  userId: Uuid;
  attemptId: Uuid;
  title: string;
  participantNameSnapshot: string;
  quizTitleSnapshot: string;
  programTitleSnapshot: string;
  organizationNameSnapshot: string;
  status: CertificateStatus;
  issuedAt: string;
  revokedAt?: string | null;
  pdfUrl?: string | null;
  pdfObjectKey?: string | null;
  qrCodeUrl?: string | null;
  qrCodeObjectKey?: string | null;
}

export interface PublicCertificateVerificationResponse {
  certificateNumber: string;
  status: CertificateStatus;
  participantName: string;
  quizTitle: string;
  programTitle: string;
  organizationName: string;
  issuedAt: string;
  isRevoked: boolean;
  revokedAt?: string | null;
  revokeReason?: string | null;
}

export interface IssueCertificateRequest {
  quizId: Uuid;
  userId: Uuid;
  attemptId: Uuid;
  title?: string | null;
}

export interface RevokeCertificateRequest {
  reason?: string | null;
}

export interface OrganizationStatsResponse {
  organizationId: Uuid;
  organizationName: string;
  programsCount: number;
  membersCount: number;
  certificatesIssued: number;
  quizzesCount: number;
}

export interface ProgramStatsResponse {
  programId: Uuid;
  programTitle: string;
  enrollmentsCount: number;
  resourcesCount: number;
  quizzesCount: number;
  attemptsCount: number;
  certificatesIssued: number;
}

export interface QuizStatsResponse {
  quizId: Uuid;
  quizTitle: string;
  attemptsCount: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passCount: number;
  failCount: number;
  passRate: number;
}

export interface AuditLogResponse {
  id: Uuid;
  organizationId: Uuid;
  actorId?: Uuid | null;
  actorName?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: Uuid | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface R2UploadUrlRequest {
  programId: Uuid;
  objectKey: string;
  contentType?: string | null;
}

export interface R2UploadUrlResponse {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  expiresAt: string;
}

export interface CloudinarySignatureRequest {
  organizationId?: Uuid | null;
  programId?: Uuid | null;
  params: Record<string, string>;
}

export interface CloudinarySignatureResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  signedParams: Record<string, string>;
}

