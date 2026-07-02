export type ProgramStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ProgramResponse {
  id: string;
  organizationId: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  status: ProgramStatus;
  isPublished: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface CreateProgramRequest {
  title: string;
  description?: string;
  coverImageUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProgramRequest {
  title: string;
  description?: string;
  coverImageUrl?: string;
  startDate?: string;
  endDate?: string;
}
