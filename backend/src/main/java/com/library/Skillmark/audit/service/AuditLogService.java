package com.library.Skillmark.audit.service;

import com.library.Skillmark.audit.entity.AuditLog;
import com.library.Skillmark.audit.enums.AuditAction;
import com.library.Skillmark.audit.repository.AuditLogRepository;
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

    public void record(UUID actorUserId, AuditAction action, String entityType, UUID entityId) {
        AuditLog log = new AuditLog();
        log.setActorUserId(actorUserId);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        repository.save(log);
    }

    public void record(UUID actorUserId, UUID ignoredOrganizationId, AuditAction action, String entityType, UUID entityId) {
        record(actorUserId, action, entityType, entityId);
    }

    public PageResponse<AuditLogResponse> listAll(UUID actorId, int page, int size) {
        authorizationService.ensureAdmin(actorId);
        return PageResponse.fromList(repository.findAllByOrderByCreatedAtDesc().stream()
                .map(AuditLogResponse::from)
                .toList(), page, size);
    }

    public PageResponse<AuditLogResponse> listForOrganization(UUID ignoredOrganizationId, UUID actorId, int page, int size) {
        return listAll(actorId, page, size);
    }
}
