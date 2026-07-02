export type MembershipRole = 'OWNER' | 'PARTICIPANT';
export type MembershipStatus = 'ACTIVE' | 'INVITED' | 'DISABLED';

export interface MembershipResponse {
  id: string;
  userId: string;
  organizationId: string;
  role: MembershipRole;
  status: MembershipStatus;
  joinedAt: string;
}
