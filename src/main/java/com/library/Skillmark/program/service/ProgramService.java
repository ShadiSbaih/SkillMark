package com.library.Skillmark.program.service;

import com.library.Skillmark.audit.enums.AuditAction;
import com.library.Skillmark.audit.service.AuditLogService;
import com.library.Skillmark.common.exception.NotFoundException;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.organization.repository.OrganizationRepository;
import com.library.Skillmark.enrollment.enums.EnrollmentStatus;
import com.library.Skillmark.enrollment.repository.ProgramEnrollmentRepository;
import com.library.Skillmark.membership.enums.MembershipRole;
import com.library.Skillmark.membership.enums.MembershipStatus;
import com.library.Skillmark.membership.repository.OrganizationMembershipRepository;
import com.library.Skillmark.program.dto.CreateProgramRequest;
import com.library.Skillmark.program.dto.ProgramResponse;
import com.library.Skillmark.program.dto.UpdateProgramRequest;
import com.library.Skillmark.program.entity.Program;
import com.library.Skillmark.program.enums.ProgramStatus;
import com.library.Skillmark.program.repository.ProgramRepository;
import com.library.Skillmark.security.service.AuthorizationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.UUID;

@Service
public class ProgramService {
    private final ProgramRepository programRepository;
    private final OrganizationRepository organizationRepository;
    private final ProgramEnrollmentRepository enrollmentRepository;
    private final OrganizationMembershipRepository membershipRepository;
    private final AuthorizationService authorizationService;
    private final AuditLogService auditLogService;

    public ProgramService(ProgramRepository programRepository,
                          OrganizationRepository organizationRepository,
                          ProgramEnrollmentRepository enrollmentRepository,
                          OrganizationMembershipRepository membershipRepository,
                          AuthorizationService authorizationService,
                          AuditLogService auditLogService) {
        this.programRepository = programRepository;
        this.organizationRepository = organizationRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.membershipRepository = membershipRepository;
        this.authorizationService = authorizationService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public ProgramResponse create(UUID organizationId, CreateProgramRequest request, UUID actorId) {
        authorizationService.ensureOrganizationOwner(organizationId, actorId);
        var organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new NotFoundException("Organization not found"));
        Program program = new Program();
        program.setOrganization(organization);
        apply(program, request.title(), request.description(), request.coverImageUrl(), request.startDate(), request.endDate());
        Program saved = programRepository.save(program);
        auditLogService.record(actorId, organizationId, AuditAction.PROGRAM_CREATED, "Program", saved.getId());
        return ProgramResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProgramResponse> list(UUID organizationId, UUID actorId, int page, int size) {
        authorizationService.ensureOrganizationMember(organizationId, actorId);
        boolean owner = membershipRepository.existsByOrganizationIdAndUserIdAndRoleAndStatus(
                organizationId, actorId, MembershipRole.OWNER, MembershipStatus.ACTIVE);
        var programs = owner
                ? programRepository.findByOrganizationIdAndStatusNot(organizationId, ProgramStatus.DELETED).stream()
                : enrollmentRepository.findByUserIdAndStatus(actorId, EnrollmentStatus.ACTIVE).stream()
                .map(enrollment -> enrollment.getProgram())
                .filter(program -> program.getOrganization().getId().equals(organizationId))
                .filter(program -> program.getStatus() != ProgramStatus.DELETED);
        return PageResponse.fromList(programs
                .sorted(Comparator.comparing(Program::getCreatedAt).reversed())
                .map(ProgramResponse::from)
                .toList(), page, size);
    }

    @Transactional(readOnly = true)
    public ProgramResponse get(UUID programId, UUID actorId) {
        return ProgramResponse.from(authorizationService.ensureProgramAccessible(programId, actorId));
    }

    @Transactional
    public ProgramResponse update(UUID programId, UpdateProgramRequest request, UUID actorId) {
        Program program = authorizationService.ensureProgramOwner(programId, actorId);
        apply(program, request.title(), request.description(), request.coverImageUrl(), request.startDate(), request.endDate());
        auditLogService.record(actorId, program.getOrganization().getId(), AuditAction.PROGRAM_UPDATED, "Program", programId);
        return ProgramResponse.from(program);
    }

    @Transactional
    public ProgramResponse publish(UUID programId, UUID actorId) {
        Program program = authorizationService.ensureProgramOwner(programId, actorId);
        program.setPublished(true);
        program.setStatus(ProgramStatus.PUBLISHED);
        auditLogService.record(actorId, program.getOrganization().getId(), AuditAction.PROGRAM_PUBLISHED, "Program", programId);
        return ProgramResponse.from(program);
    }

    @Transactional
    public ProgramResponse archive(UUID programId, UUID actorId) {
        Program program = authorizationService.ensureProgramOwner(programId, actorId);
        program.setPublished(false);
        program.setStatus(ProgramStatus.ARCHIVED);
        auditLogService.record(actorId, program.getOrganization().getId(), AuditAction.PROGRAM_ARCHIVED, "Program", programId);
        return ProgramResponse.from(program);
    }

    @Transactional
    public void delete(UUID programId, UUID actorId) {
        Program program = authorizationService.ensureProgramOwner(programId, actorId);
        program.setPublished(false);
        program.setStatus(ProgramStatus.DELETED);
        program.setDeletedAt(Instant.now());
    }

    private void apply(Program program, String title, String description, String coverImageUrl, Instant startDate, Instant endDate) {
        program.setTitle(title.trim());
        program.setDescription(description);
        program.setCoverImageUrl(coverImageUrl);
        program.setStartDate(startDate);
        program.setEndDate(endDate);
    }
}
