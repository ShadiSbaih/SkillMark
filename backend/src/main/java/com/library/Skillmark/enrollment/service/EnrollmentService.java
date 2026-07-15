package com.library.Skillmark.enrollment.service;

import com.library.Skillmark.audit.enums.AuditAction;
import com.library.Skillmark.audit.service.AuditLogService;
import com.library.Skillmark.common.exception.ConflictException;
import com.library.Skillmark.common.exception.BusinessRuleException;
import com.library.Skillmark.common.exception.NotFoundException;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.enrollment.dto.CreateEnrollmentRequest;
import com.library.Skillmark.enrollment.dto.EnrollmentResponse;
import com.library.Skillmark.enrollment.entity.ProgramEnrollment;
import com.library.Skillmark.enrollment.enums.EnrollmentStatus;
import com.library.Skillmark.enrollment.repository.ProgramEnrollmentRepository;
import com.library.Skillmark.membership.service.MembershipService;
import com.library.Skillmark.program.entity.Program;
import com.library.Skillmark.program.enums.ProgramStatus;
import com.library.Skillmark.program.repository.ProgramRepository;
import com.library.Skillmark.security.service.AuthorizationService;
import com.library.Skillmark.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.UUID;

@Service
public class EnrollmentService {
    private final ProgramEnrollmentRepository enrollmentRepository;
    private final ProgramRepository programRepository;
    private final UserRepository userRepository;
    private final MembershipService membershipService;
    private final AuthorizationService authorizationService;
    private final AuditLogService auditLogService;

    public EnrollmentService(ProgramEnrollmentRepository enrollmentRepository,
                             ProgramRepository programRepository,
                             UserRepository userRepository,
                             MembershipService membershipService,
                             AuthorizationService authorizationService,
                             AuditLogService auditLogService) {
        this.enrollmentRepository = enrollmentRepository;
        this.programRepository = programRepository;
        this.userRepository = userRepository;
        this.membershipService = membershipService;
        this.authorizationService = authorizationService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public EnrollmentResponse enroll(UUID programId, CreateEnrollmentRequest request, UUID actorId) {
        Program program = authorizationService.ensureProgramOwner(programId, actorId);
        if (program.getStatus() == ProgramStatus.ARCHIVED || program.getDeletedAt() != null) {
            throw new BusinessRuleException("Archived programs cannot accept new enrollments");
        }
        var user = userRepository.findById(request.userId()).orElseThrow(() -> new NotFoundException("User not found"));
        if (enrollmentRepository.existsByProgramIdAndUserIdAndStatus(programId, request.userId(), EnrollmentStatus.ACTIVE)) {
            throw new ConflictException("User is already actively enrolled in this program");
        }
        membershipService.ensureActiveMembership(program.getOrganization(), user, user);
        ProgramEnrollment enrollment = new ProgramEnrollment();
        enrollment.setProgram(program);
        enrollment.setUser(user);
        ProgramEnrollment saved = enrollmentRepository.save(enrollment);
        auditLogService.record(actorId, program.getOrganization().getId(), AuditAction.USER_ENROLLED, "ProgramEnrollment", saved.getId());
        return EnrollmentResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<EnrollmentResponse> list(UUID programId, UUID actorId, int page, int size) {
        authorizationService.ensureProgramOwner(programId, actorId);
        return PageResponse.fromList(enrollmentRepository.findByProgramIdAndStatus(programId, EnrollmentStatus.ACTIVE).stream()
                .sorted(Comparator.comparing(ProgramEnrollment::getEnrolledAt).reversed())
                .map(EnrollmentResponse::from)
                .toList(), page, size);
    }

    @Transactional(readOnly = true)
    public PageResponse<EnrollmentResponse> mine(UUID userId, int page, int size) {
        return PageResponse.fromList(enrollmentRepository.findByUserIdAndStatus(userId, EnrollmentStatus.ACTIVE).stream()
                .sorted(Comparator.comparing(ProgramEnrollment::getEnrolledAt).reversed())
                .map(EnrollmentResponse::from)
                .toList(), page, size);
    }

    @Transactional
    public void remove(UUID programId, UUID userId, UUID actorId) {
        Program program = authorizationService.ensureProgramOwner(programId, actorId);
        ProgramEnrollment enrollment = enrollmentRepository.findByProgramIdAndUserIdAndStatus(programId, userId, EnrollmentStatus.ACTIVE)
                .orElseThrow(() -> new NotFoundException("Active enrollment not found"));
        enrollment.setStatus(EnrollmentStatus.REMOVED);
        enrollment.setRemovedAt(Instant.now());
        auditLogService.record(actorId, program.getOrganization().getId(), AuditAction.USER_REMOVED_FROM_PROGRAM, "ProgramEnrollment", enrollment.getId());
    }
}
