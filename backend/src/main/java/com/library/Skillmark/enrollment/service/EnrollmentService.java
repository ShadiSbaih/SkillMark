package com.library.Skillmark.enrollment.service;

import com.library.Skillmark.audit.enums.AuditAction;
import com.library.Skillmark.audit.service.AuditLogService;
import com.library.Skillmark.common.exception.ConflictException;
import com.library.Skillmark.common.exception.BusinessRuleException;
import com.library.Skillmark.common.exception.ForbiddenException;
import com.library.Skillmark.common.exception.NotFoundException;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.email.service.EmailService;
import com.library.Skillmark.enrollment.dto.CreateEnrollmentRequest;
import com.library.Skillmark.enrollment.dto.EnrollmentResponse;
import com.library.Skillmark.enrollment.entity.ProgramEnrollment;
import com.library.Skillmark.enrollment.enums.EnrollmentStatus;
import com.library.Skillmark.enrollment.repository.ProgramEnrollmentRepository;
import com.library.Skillmark.program.entity.Program;
import com.library.Skillmark.program.enums.ProgramStatus;
import com.library.Skillmark.program.repository.ProgramRepository;
import com.library.Skillmark.security.service.AuthorizationService;
import com.library.Skillmark.user.entity.User;
import com.library.Skillmark.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
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
    private final AuthorizationService authorizationService;
    private final AuditLogService auditLogService;
    private final EmailService emailService;

    public EnrollmentService(ProgramEnrollmentRepository enrollmentRepository,
                              ProgramRepository programRepository,
                              UserRepository userRepository,
                              AuthorizationService authorizationService,
                              AuditLogService auditLogService,
                              EmailService emailService) {
        this.enrollmentRepository = enrollmentRepository;
        this.programRepository = programRepository;
        this.userRepository = userRepository;
        this.authorizationService = authorizationService;
        this.auditLogService = auditLogService;
        this.emailService = emailService;
    }

    @Transactional
    public EnrollmentResponse enroll(UUID programId, CreateEnrollmentRequest request, UUID actorId) {
        Program program = programRepository.findById(programId).orElseThrow(() -> new NotFoundException("Program not found"));
        if (program.getDeletedAt() != null || program.getStatus() == ProgramStatus.ARCHIVED) {
            throw new BusinessRuleException("Archived or deleted programs cannot accept new enrollments");
        }
        boolean admin = authorizationService.isAdmin(actorId);
        if (!admin) {
            if (!request.userId().equals(actorId)) {
                throw new ForbiddenException("Students can only enroll themselves");
            }
            if (program.getStatus() != ProgramStatus.PUBLISHED) {
                throw new NotFoundException("Program not found");
            }
        }
        var user = userRepository.findById(request.userId()).orElseThrow(() -> new NotFoundException("User not found"));
        if (enrollmentRepository.existsByProgramIdAndUserIdAndStatus(programId, request.userId(), EnrollmentStatus.ACTIVE)) {
            throw new ConflictException("User is already actively enrolled in this program");
        }
        ProgramEnrollment enrollment = new ProgramEnrollment();
        enrollment.setProgram(program);
        enrollment.setUser(user);
        ProgramEnrollment saved = enrollmentRepository.save(enrollment);
        auditLogService.record(actorId, null, AuditAction.USER_ENROLLED, "ProgramEnrollment", saved.getId());
        sendEnrollmentConfirmationEmail(saved);
        return EnrollmentResponse.from(saved);
    }

    @Async
    public void sendEnrollmentConfirmationEmail(ProgramEnrollment enrollment) {
        try {
            Program program = enrollment.getProgram();
            User user = enrollment.getUser();
            emailService.sendEnrollmentConfirmationEmail(
                    user.getEmail(),
                    user.getName(),
                    program.getTitle(),
                    "/programs/" + program.getId() + "/learn"
            );
        } catch (Exception ex) {
            // Email failures should not break enrollment
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<EnrollmentResponse> list(UUID programId, UUID actorId, int page, int size) {
        authorizationService.ensureProgramOwner(programId, actorId);
        Pageable pageable = PageRequest.of(page, Math.max(1, size), Sort.by(Sort.Direction.DESC, "enrolledAt"));
        Page<ProgramEnrollment> dbPage = enrollmentRepository.findByProgramIdAndStatus(programId, EnrollmentStatus.ACTIVE, pageable);
        return PageResponse.from(dbPage.map(EnrollmentResponse::from));
    }

    @Transactional(readOnly = true)
    public PageResponse<EnrollmentResponse> mine(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.max(1, size), Sort.by(Sort.Direction.DESC, "enrolledAt"));
        Page<ProgramEnrollment> dbPage = enrollmentRepository.findByUserIdAndStatus(userId, EnrollmentStatus.ACTIVE, pageable);
        return PageResponse.from(dbPage.map(EnrollmentResponse::from));
    }

    @Transactional
    public void remove(UUID programId, UUID userId, UUID actorId) {
        Program program = authorizationService.ensureProgramOwner(programId, actorId);
        ProgramEnrollment enrollment = enrollmentRepository.findByProgramIdAndUserIdAndStatus(programId, userId, EnrollmentStatus.ACTIVE)
                .orElseThrow(() -> new NotFoundException("Active enrollment not found"));
        enrollment.setStatus(EnrollmentStatus.REMOVED);
        enrollment.setRemovedAt(Instant.now());
        auditLogService.record(actorId, null, AuditAction.USER_REMOVED_FROM_PROGRAM, "ProgramEnrollment", enrollment.getId());
    }
}
