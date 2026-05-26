package com.library.Skillmark.resource.service;

import com.library.Skillmark.audit.enums.AuditAction;
import com.library.Skillmark.audit.service.AuditLogService;
import com.library.Skillmark.common.exception.BadRequestException;
import com.library.Skillmark.common.exception.NotFoundException;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.resource.dto.CreateResourceRequest;
import com.library.Skillmark.resource.dto.ResourceResponse;
import com.library.Skillmark.resource.entity.ProgramResource;
import com.library.Skillmark.resource.enums.ResourceStatus;
import com.library.Skillmark.resource.enums.ResourceType;
import com.library.Skillmark.resource.enums.StorageProvider;
import com.library.Skillmark.resource.repository.ProgramResourceRepository;
import com.library.Skillmark.security.service.AuthorizationService;
import com.library.Skillmark.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ResourceService {
    private final ProgramResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final AuthorizationService authorizationService;
    private final AuditLogService auditLogService;

    public ResourceService(ProgramResourceRepository resourceRepository,
                           UserRepository userRepository,
                           AuthorizationService authorizationService,
                           AuditLogService auditLogService) {
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.authorizationService = authorizationService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public ResourceResponse create(UUID programId, CreateResourceRequest request, UUID actorId) {
        var program = authorizationService.ensureProgramOwner(programId, actorId);
        validateStorage(request);
        ProgramResource resource = new ProgramResource();
        resource.setProgram(program);
        resource.setCreatedBy(userRepository.findById(actorId).orElseThrow(() -> new NotFoundException("User not found")));
        resource.setTitle(request.title().trim());
        resource.setDescription(request.description());
        resource.setType(request.type());
        resource.setUrl(request.url());
        resource.setStorageProvider(request.storageProvider() == null ? StorageProvider.EXTERNAL : request.storageProvider());
        resource.setObjectKey(request.objectKey());
        resource.setPosition(request.position());
        ProgramResource saved = resourceRepository.save(resource);
        auditLogService.record(actorId, program.getOrganization().getId(), AuditAction.RESOURCE_CREATED, "ProgramResource", saved.getId());
        return ResourceResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<ResourceResponse> list(UUID programId, UUID actorId, int page, int size) {
        var program = authorizationService.ensureProgramAccessible(programId, actorId);
        boolean owner = program.getOrganization().getOwner().getId().equals(actorId);
        var resources = owner
                ? resourceRepository.findByProgramIdOrderByPositionAsc(programId)
                : resourceRepository.findByProgramIdAndStatusOrderByPositionAsc(programId, ResourceStatus.ACTIVE);
        return PageResponse.fromList(resources.stream().map(ResourceResponse::from).toList(), page, size);
    }

    @Transactional(readOnly = true)
    public ResourceResponse get(UUID resourceId, UUID actorId) {
        ProgramResource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new NotFoundException("Resource not found"));
        authorizationService.ensureProgramAccessible(resource.getProgram().getId(), actorId);
        return ResourceResponse.from(resource);
    }

    @Transactional
    public ResourceResponse update(UUID resourceId, CreateResourceRequest request, UUID actorId) {
        ProgramResource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new NotFoundException("Resource not found"));
        authorizationService.ensureProgramOwner(resource.getProgram().getId(), actorId);
        validateStorage(request);
        resource.setTitle(request.title().trim());
        resource.setDescription(request.description());
        resource.setType(request.type());
        resource.setUrl(request.url());
        resource.setStorageProvider(request.storageProvider() == null ? StorageProvider.EXTERNAL : request.storageProvider());
        resource.setObjectKey(request.objectKey());
        resource.setPosition(request.position());
        auditLogService.record(actorId, resource.getProgram().getOrganization().getId(), AuditAction.RESOURCE_CREATED, "ProgramResource", resourceId);
        return ResourceResponse.from(resource);
    }

    @Transactional
    public void archive(UUID resourceId, UUID actorId) {
        ProgramResource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new NotFoundException("Resource not found"));
        authorizationService.ensureProgramOwner(resource.getProgram().getId(), actorId);
        resource.setStatus(ResourceStatus.ARCHIVED);
        auditLogService.record(actorId, resource.getProgram().getOrganization().getId(), AuditAction.RESOURCE_ARCHIVED, "ProgramResource", resourceId);
    }

    private void validateStorage(CreateResourceRequest request) {
        StorageProvider provider = request.storageProvider() == null ? StorageProvider.EXTERNAL : request.storageProvider();
        if ((request.type() == ResourceType.FILE || request.type() == ResourceType.IMAGE) && request.objectKey() == null && request.url() == null) {
            throw new BadRequestException("Stored resources require a URL or object key");
        }
        if (request.type() == ResourceType.LINK && provider != StorageProvider.EXTERNAL) {
            throw new BadRequestException("LINK resources must use EXTERNAL storage provider");
        }
    }
}
