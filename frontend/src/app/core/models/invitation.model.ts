export type InvitationStatus = 'ACTIVE' | 'DISABLED' | 'EXPIRED';

export interface Invitation {
  id: string;
  organizationId: string;
  programId: string;
  code: string;
  description: string | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  status: InvitationStatus;
  disabledAt: string | null;
  createdAt: string;
}

export interface CreateInvitationRequest {
  description: string | null;
  maxUses: number | null;
  expiresAt: string | null;
}

export interface UpdateInvitationStatusRequest {
  status: InvitationStatus;
}
