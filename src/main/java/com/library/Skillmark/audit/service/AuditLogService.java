package com.library.Skillmark.audit.service;

import com.library.Skillmark.audit.entity.*;
import com.library.Skillmark.audit.enums.*;
import com.library.Skillmark.audit.repository.*;
import com.library.Skillmark.audit.service.*;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuditLogService {
    private final AuditLogRepository repository;

    public AuditLogService(AuditLogRepository repository) {
        this.repository = repository;
    }

    public void record(UUID actorUserId, UUID organizationId, AuditAction action, String entityType, UUID entityId) {
        AuditLog log = new AuditLog();
        log.setActorUserId(actorUserId);
        log.setOrganizationId(organizationId);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        repository.save(log);
    }
}
