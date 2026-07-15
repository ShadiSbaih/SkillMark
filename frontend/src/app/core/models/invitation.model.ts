export type InvitationStatus = 'ACTIVE' | 'DISABLED';

export interface Invitation {
  id: string;
  organizationId: string;
  programId: string;
  code: string;
  inviteUrl: string | null;
  description: string | null;
  status: InvitationStatus;
  disabledAt: string | null;
  createdAt: string;
}

export interface CreateInvitationRequest {
  description: string | null;
  emails?: string[] | null;
}

export interface UpdateInvitationStatusRequest {
  status: InvitationStatus;
}

export interface InvitationPreview {
  code: string;
  programTitle: string;
  organizationName: string;
  valid: boolean;
}
