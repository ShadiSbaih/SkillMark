export type CertificateStatus = 'ACTIVE' | 'REVOKED';

export interface CertificateResponse {
  id: string;
  certificateNumber: string;
  verificationCode: string;
  organizationId: string;
  programId: string;
  quizId: string;
  userId: string;
  attemptId: string;
  title: string;
  participantNameSnapshot: string;
  quizTitleSnapshot: string;
  programTitleSnapshot: string;
  organizationNameSnapshot: string;
  status: CertificateStatus;
  issuedAt: string;
  revokedAt: string | null;
  pdfUrl: string | null;
  pdfObjectKey: string | null;
  qrCodeUrl: string | null;
  qrCodeObjectKey: string | null;
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
  revokedAt: string | null;
  revokeReason: string | null;
}

export interface IssueCertificateRequest {
  quizId: string;
  userId: string;
  attemptId: string;
  title?: string;
}

export interface RevokeCertificateRequest {
  reason: string;
}
