export interface AuditLogResponse {
  id: string;
  actorUserId: string;
  organizationId: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
