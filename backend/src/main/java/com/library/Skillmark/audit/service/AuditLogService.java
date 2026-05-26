package com.library.Skillmark.audit.service;

import com.library.Skillmark.audit.entity.*;
import com.library.Skillmark.audit.enums.*;
import com.library.Skillmark.audit.repository.*;
import com.library.Skillmark.audit.service.*;
import com.library.Skillmark.audit.dto.AuditLogResponse;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.security.service.AuthorizationService;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuditLogService {
    private final AuditLogRepository repository;
    private final AuthorizationService authorizationService;

    public AuditLogService(AuditLogRepository repository, AuthorizationService authorizationService) {
        this.repository = repository;
        this.authorizationService = authorizationService;
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

    public PageResponse<AuditLogResponse> listForOrganization(UUID organizationId, UUID actorId, int page, int size) {
        authorizationService.ensureOrganizationOwner(organizationId, actorId);
        return PageResponse.fromList(repository.findByOrganizationIdOrderByCreatedAtDesc(organizationId).stream()
                .map(AuditLogResponse::from)
                .toList(), page, size);
    }
}
