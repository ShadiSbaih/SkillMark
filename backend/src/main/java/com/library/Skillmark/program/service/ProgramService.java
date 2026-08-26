package com.library.Skillmark.program.service;

import com.library.Skillmark.audit.enums.AuditAction;
import com.library.Skillmark.audit.service.AuditLogService;
import com.library.Skillmark.common.exception.BusinessRuleException;
import com.library.Skillmark.common.exception.NotFoundException;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.enrollment.enums.EnrollmentStatus;
import com.library.Skillmark.enrollment.repository.ProgramEnrollmentRepository;
import com.library.Skillmark.program.dto.CreateProgramRequest;
import com.library.Skillmark.program.dto.ProgramResponse;
import com.library.Skillmark.program.dto.UpdateProgramRequest;
import com.library.Skillmark.program.entity.Program;
import com.library.Skillmark.program.enums.ProgramStatus;
import com.library.Skillmark.program.repository.ProgramRepository;
import com.library.Skillmark.security.service.AuthorizationService;
import com.library.Skillmark.user.entity.User;
import com.library.Skillmark.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class ProgramService {
    private final ProgramRepository programRepository;
    private final ProgramEnrollmentRepository enrollmentRepository;
    private final AuthorizationService authorizationService;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    public ProgramService(ProgramRepository programRepository,
                          ProgramEnrollmentRepository enrollmentRepository,
                          AuthorizationService authorizationService,
                          AuditLogService auditLogService,
                          UserRepository userRepository) {
        this.programRepository = programRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.authorizationService = authorizationService;
        this.auditLogService = auditLogService;
        this.userRepository = userRepository;
    }

    @Transactional
    public ProgramResponse create(CreateProgramRequest request, UUID actorId) {
        authorizationService.ensureAdmin(actorId);
        User creator = userRepository.findById(actorId).orElseThrow(() -> new NotFoundException("User not found"));
        Program program = new Program();
        program.setCreatedBy(creator);
        apply(program, request.title(), request.description(), request.coverImageUrl(), request.startDate(), request.endDate());
        Program saved = programRepository.save(program);
        auditLogService.record(actorId, null, AuditAction.PROGRAM_CREATED, "Program", saved.getId());
        return ProgramResponse.from(saved);
    }

    @Transactional
    public ProgramResponse create(UUID ignoredOrgId, CreateProgramRequest request, UUID actorId) {
        return create(request, actorId);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProgramResponse> list(UUID actorId, int page, int size) {
        boolean admin = authorizationService.isAdmin(actorId);
        List<Program> programs = admin
                ? programRepository.findByDeletedAtIsNull()
                : programRepository.findByStatusAndDeletedAtIsNull(ProgramStatus.PUBLISHED);
        return PageResponse.fromList(programs.stream()
                .sorted(Comparator.comparing(Program::getCreatedAt).reversed())
                .map(ProgramResponse::from)
                .toList(), page, size);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProgramResponse> list(UUID ignoredOrgId, UUID actorId, int page, int size) {
        return list(actorId, page, size);
    }

    @Transactional(readOnly = true)
    public ProgramResponse get(UUID programId, UUID actorId) {
        return ProgramResponse.from(authorizationService.ensureProgramAccessible(programId, actorId));
    }

    @Transactional
    public ProgramResponse update(UUID programId, UpdateProgramRequest request, UUID actorId) {
        Program program = authorizationService.ensureProgramOwner(programId, actorId);
        apply(program, request.title(), request.description(), request.coverImageUrl(), request.startDate(), request.endDate());
        auditLogService.record(actorId, null, AuditAction.PROGRAM_UPDATED, "Program", programId);
        return ProgramResponse.from(program);
    }

    @Transactional
    public ProgramResponse publish(UUID programId, UUID actorId) {
        Program program = authorizationService.ensureProgramOwner(programId, actorId);
        program.setStatus(ProgramStatus.PUBLISHED);
        auditLogService.record(actorId, null, AuditAction.PROGRAM_PUBLISHED, "Program", programId);
        return ProgramResponse.from(program);
    }

    @Transactional
    public ProgramResponse archive(UUID programId, UUID actorId) {
        Program program = authorizationService.ensureProgramOwner(programId, actorId);
        program.setStatus(ProgramStatus.ARCHIVED);
        auditLogService.record(actorId, null, AuditAction.PROGRAM_ARCHIVED, "Program", programId);
        return ProgramResponse.from(program);
    }

    @Transactional
    public ProgramResponse updateStatus(UUID programId, ProgramStatus status, UUID actorId) {
        if (status == ProgramStatus.PUBLISHED) {
            return publish(programId, actorId);
        }
        if (status == ProgramStatus.ARCHIVED) {
            return archive(programId, actorId);
        }
        throw new BusinessRuleException("Program status can only be changed to PUBLISHED or ARCHIVED");
    }

    @Transactional
    public void delete(UUID programId, UUID actorId) {
        Program program = authorizationService.ensureProgramOwner(programId, actorId);
        program.setStatus(ProgramStatus.ARCHIVED);
        program.setDeletedAt(Instant.now());
    }

    private void apply(Program program, String title, String description, String coverImageUrl, LocalDate startDate, LocalDate endDate) {
        program.setTitle(title.trim());
        program.setDescription(description);
        program.setCoverImageUrl(coverImageUrl);
        program.setStartDate(startDate);
        program.setEndDate(endDate);
    }
}
