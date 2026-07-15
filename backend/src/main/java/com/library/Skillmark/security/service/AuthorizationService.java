package com.library.Skillmark.security.service;

import com.library.Skillmark.attempt.entity.QuizAttempt;
import com.library.Skillmark.attempt.repository.QuizAttemptRepository;
import com.library.Skillmark.certificate.entity.Certificate;
import com.library.Skillmark.certificate.repository.CertificateRepository;
import com.library.Skillmark.common.exception.ForbiddenException;
import com.library.Skillmark.common.exception.NotFoundException;
import com.library.Skillmark.enrollment.enums.EnrollmentStatus;
import com.library.Skillmark.enrollment.repository.ProgramEnrollmentRepository;
import com.library.Skillmark.membership.enums.MembershipRole;
import com.library.Skillmark.membership.enums.MembershipStatus;
import com.library.Skillmark.membership.repository.OrganizationMembershipRepository;
import com.library.Skillmark.organization.enums.OrganizationStatus;
import com.library.Skillmark.organization.repository.OrganizationRepository;
import com.library.Skillmark.program.entity.Program;
import com.library.Skillmark.program.enums.ProgramStatus;
import com.library.Skillmark.program.repository.ProgramRepository;
import com.library.Skillmark.quiz.entity.Quiz;
import com.library.Skillmark.quiz.repository.QuizRepository;
import com.library.Skillmark.quiz.enums.QuizStatus;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthorizationService {
    private final OrganizationMembershipRepository membershipRepository;
    private final OrganizationRepository organizationRepository;
    private final ProgramRepository programRepository;
    private final ProgramEnrollmentRepository enrollmentRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository attemptRepository;
    private final CertificateRepository certificateRepository;

    public AuthorizationService(OrganizationMembershipRepository membershipRepository,
                                OrganizationRepository organizationRepository,
                                ProgramRepository programRepository,
                                ProgramEnrollmentRepository enrollmentRepository,
                                QuizRepository quizRepository,
                                QuizAttemptRepository attemptRepository,
                                CertificateRepository certificateRepository) {
        this.membershipRepository = membershipRepository;
        this.organizationRepository = organizationRepository;
        this.programRepository = programRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.quizRepository = quizRepository;
        this.attemptRepository = attemptRepository;
        this.certificateRepository = certificateRepository;
    }

    public void ensureOrganizationOwner(UUID organizationId, UUID userId) {
        ensureOrganizationNotDeleted(organizationId);
        if (membershipRepository.existsByOrganizationIdAndUserIdAndRoleAndStatus(
                organizationId, userId, MembershipRole.OWNER, MembershipStatus.ACTIVE)) {
            return;
        }
        if (membershipRepository.existsByOrganizationIdAndUserIdAndStatus(
                organizationId, userId, MembershipStatus.ACTIVE)) {
            throw new ForbiddenException("Organization owner permission is required");
        }
        throw new NotFoundException("Organization not found");
    }

    public void ensureOrganizationMember(UUID organizationId, UUID userId) {
        ensureOrganizationNotDeleted(organizationId);
        if (!membershipRepository.existsByOrganizationIdAndUserIdAndStatus(
                organizationId, userId, MembershipStatus.ACTIVE)) {
            throw new NotFoundException("Organization not found");
        }
    }

    public void ensureActiveParticipantMember(UUID organizationId, UUID userId) {
        if (!membershipRepository.existsByOrganizationIdAndUserIdAndRoleAndStatus(
                organizationId, userId, MembershipRole.PARTICIPANT, MembershipStatus.ACTIVE)) {
            throw new ForbiddenException("Active participant membership is required");
        }
    }

    public Program ensureProgramOwner(UUID programId, UUID userId) {
        Program program = programRepository.findById(programId)
                .orElseThrow(() -> new NotFoundException("Program not found"));
        ensureProgramNotDeleted(program);
        ensureOrganizationOwner(program.getOrganization().getId(), userId);
        return program;
    }

    public Program ensureProgramAccessible(UUID programId, UUID userId) {
        Program program = programRepository.findById(programId)
                .orElseThrow(() -> new NotFoundException("Program not found"));
        ensureProgramNotDeleted(program);
        if (membershipRepository.existsByOrganizationIdAndUserIdAndRoleAndStatus(
                program.getOrganization().getId(), userId, MembershipRole.OWNER, MembershipStatus.ACTIVE)) {
            return program;
        }
        if (!enrollmentRepository.existsByProgramIdAndUserIdAndStatus(programId, userId, EnrollmentStatus.ACTIVE)) {
            throw new NotFoundException("Program not found");
        }
        return program;
    }

    public void ensureProgramEnrollment(UUID programId, UUID userId) {
        Program program = programRepository.findById(programId)
                .orElseThrow(() -> new NotFoundException("Program not found"));
        ensureProgramNotDeleted(program);
        if (membershipRepository.existsByOrganizationIdAndUserIdAndRoleAndStatus(
                program.getOrganization().getId(), userId, MembershipRole.OWNER, MembershipStatus.ACTIVE)) {
            return;
        }
        if (!enrollmentRepository.existsByProgramIdAndUserIdAndStatus(programId, userId, EnrollmentStatus.ACTIVE)) {
            throw new ForbiddenException("Active program enrollment is required");
        }
    }

    public Quiz ensureQuizOwner(UUID quizId, UUID userId) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> new NotFoundException("Quiz not found"));
        ensureQuizNotDeleted(quiz);
        ensureOrganizationOwner(quiz.getProgram().getOrganization().getId(), userId);
        return quiz;
    }

    public Quiz ensureQuizAccessible(UUID quizId, UUID userId) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> new NotFoundException("Quiz not found"));
        ensureQuizNotDeleted(quiz);
        UUID organizationId = quiz.getProgram().getOrganization().getId();
        if (membershipRepository.existsByOrganizationIdAndUserIdAndRoleAndStatus(
                organizationId, userId, MembershipRole.OWNER, MembershipStatus.ACTIVE)) {
            return quiz;
        }
        if (!enrollmentRepository.existsByProgramIdAndUserIdAndStatus(quiz.getProgram().getId(), userId, EnrollmentStatus.ACTIVE)) {
            throw new NotFoundException("Quiz not found");
        }
        if (quiz.getStatus() != QuizStatus.PUBLISHED) {
            throw new ForbiddenException("Quiz is not available");
        }
        if (!quiz.isVisibleToParticipants()) {
            throw new ForbiddenException("Quiz is not available");
        }
        return quiz;
    }

    public QuizAttempt ensureAttemptOwner(UUID attemptId, UUID userId) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new NotFoundException("Attempt not found"));
        if (!attempt.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Attempt owner permission is required");
        }
        return attempt;
    }

    public QuizAttempt ensureAttemptAccessible(UUID attemptId, UUID userId) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new NotFoundException("Attempt not found"));
        if (attempt.getUser().getId().equals(userId)) {
            return attempt;
        }
        ensureOrganizationOwner(attempt.getQuiz().getProgram().getOrganization().getId(), userId);
        return attempt;
    }

    public Certificate ensureCertificateAccessible(UUID certificateId, UUID userId) {
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new NotFoundException("Certificate not found"));
        if (certificate.getUser().getId().equals(userId)) {
            return certificate;
        }
        ensureOrganizationOwner(certificate.getOrganization().getId(), userId);
        return certificate;
    }

    private void ensureOrganizationNotDeleted(UUID organizationId) {
        var organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new NotFoundException("Organization not found"));
        if (organization.getStatus() == OrganizationStatus.DELETED || organization.getDeletedAt() != null) {
            throw new NotFoundException("Organization not found");
        }
    }

    private void ensureProgramNotDeleted(Program program) {
        ensureOrganizationNotDeleted(program.getOrganization().getId());
        if (program.getDeletedAt() != null) {
            throw new NotFoundException("Program not found");
        }
    }

    private void ensureQuizNotDeleted(Quiz quiz) {
        ensureProgramNotDeleted(quiz.getProgram());
        if (quiz.getDeletedAt() != null) {
            throw new NotFoundException("Quiz not found");
        }
    }
}
