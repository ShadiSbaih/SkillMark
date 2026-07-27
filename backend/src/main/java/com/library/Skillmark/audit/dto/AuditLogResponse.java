package com.library.Skillmark.audit.dto;

import com.library.Skillmark.audit.entity.AuditLog;
import com.library.Skillmark.audit.enums.AuditAction;

import java.time.Instant;
import java.util.UUID;

public record AuditLogResponse(
        UUID id,
        UUID actorUserId,
        AuditAction action,
        String entityType,
        UUID entityId,
        String ipAddress,
        String userAgent,
        String metadata,
        Instant createdAt
) {
    public static AuditLogResponse from(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getActorUserId(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getIpAddress(),
                log.getUserAgent(),
                log.getMetadata(),
                log.getCreatedAt()
        );
    }
}
