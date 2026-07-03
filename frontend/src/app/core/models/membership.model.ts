export type MembershipRole = 'OWNER' | 'PARTICIPANT';
export type MembershipStatus = 'ACTIVE' | 'INVITED' | 'REMOVED';

export interface MembershipResponse {
  id: string;
  organizationId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: MembershipRole;
  status: MembershipStatus;
  invitedBy: string | null;
  joinedAt: string | null;
  removedBy: string | null;
  removedAt: string | null;
  createdAt: string;
}

export interface AddMemberRequest {
  userId: string;
  role: MembershipRole;
}
