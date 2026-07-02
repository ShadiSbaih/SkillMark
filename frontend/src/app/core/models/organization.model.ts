export type OrganizationStatus = 'ACTIVE' | 'SUSPENDED';

export interface OrganizationResponse {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  ownerId: string;
  status: OrganizationStatus;
  createdAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
  description?: string;
  logoUrl?: string;
}

export interface UpdateOrganizationRequest {
  name: string;
  description?: string;
  logoUrl?: string;
}
