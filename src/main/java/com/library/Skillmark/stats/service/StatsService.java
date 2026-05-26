package com.library.Skillmark.stats.service;

import com.library.Skillmark.certificate.repository.CertificateRepository;
import com.library.Skillmark.attempt.enums.AttemptStatus;
import com.library.Skillmark.attempt.repository.QuizAttemptRepository;
import com.library.Skillmark.enrollment.enums.EnrollmentStatus;
import com.library.Skillmark.enrollment.repository.ProgramEnrollmentRepository;
import com.library.Skillmark.membership.enums.MembershipStatus;
import com.library.Skillmark.membership.repository.OrganizationMembershipRepository;
import com.library.Skillmark.program.repository.ProgramRepository;
import com.library.Skillmark.quiz.repository.QuizRepository;
import com.library.Skillmark.resource.enums.ResourceStatus;
import com.library.Skillmark.resource.repository.ProgramResourceRepository;
import com.library.Skillmark.security.service.AuthorizationService;
import com.library.Skillmark.stats.dto.OrganizationStatsResponse;
import com.library.Skillmark.stats.dto.ProgramStatsResponse;
import com.library.Skillmark.stats.dto.QuizStatsResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class StatsService {
    private final ProgramRepository programRepository;
    private final OrganizationMembershipRepository membershipRepository;
    private final CertificateRepository certificateRepository;
    private final ProgramEnrollmentRepository enrollmentRepository;
    private final ProgramResourceRepository resourceRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository attemptRepository;
    private final AuthorizationService authorizationService;

    public StatsService(ProgramRepository programRepository,
                        OrganizationMembershipRepository membershipRepository,
                        CertificateRepository certificateRepository,
                        ProgramEnrollmentRepository enrollmentRepository,
                        ProgramResourceRepository resourceRepository,
                        QuizRepository quizRepository,
                        QuizAttemptRepository attemptRepository,
                        AuthorizationService authorizationService) {
        this.programRepository = programRepository;
        this.membershipRepository = membershipRepository;
        this.certificateRepository = certificateRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.resourceRepository = resourceRepository;
        this.quizRepository = quizRepository;
        this.attemptRepository = attemptRepository;
        this.authorizationService = authorizationService;
    }

    @Transactional(readOnly = true)
    public OrganizationStatsResponse organizationStats(UUID organizationId, UUID actorId) {
        authorizationService.ensureOrganizationOwner(organizationId, actorId);
        long attempts = attemptRepository.countByQuizProgramOrganizationId(organizationId);
        long passed = attemptRepository.countByQuizProgramOrganizationIdAndPassed(organizationId, true);
        return new OrganizationStatsResponse(
                programRepository.countByOrganizationIdAndDeletedAtIsNull(organizationId),
                membershipRepository.countByOrganizationIdAndStatus(organizationId, MembershipStatus.ACTIVE),
                enrollmentRepository.countDistinctUsersByOrganizationIdAndStatus(organizationId, EnrollmentStatus.ACTIVE),
                quizRepository.countByProgramOrganizationIdAndDeletedAtIsNull(organizationId),
                attempts,
                certificateRepository.countByOrganizationId(organizationId),
                zeroIfNull(attemptRepository.averageScoreForOrganization(organizationId)),
                rate(passed, attempts)
        );
    }

    @Transactional(readOnly = true)
    public ProgramStatsResponse programStats(UUID programId, UUID actorId) {
        authorizationService.ensureProgramOwner(programId, actorId);
        long attempts = attemptRepository.countByQuizProgramId(programId);
        return new ProgramStatsResponse(
                enrollmentRepository.countByProgramId(programId),
                enrollmentRepository.countByProgramIdAndStatus(programId, EnrollmentStatus.ACTIVE),
                resourceRepository.countByProgramIdAndStatus(programId, ResourceStatus.ACTIVE),
                quizRepository.countByProgramIdAndDeletedAtIsNull(programId),
                attempts,
                attemptRepository.countByQuizProgramIdAndPassed(programId, true),
                certificateRepository.countByProgramId(programId),
                zeroIfNull(attemptRepository.averageScoreForProgram(programId))
        );
    }

    @Transactional(readOnly = true)
    public QuizStatsResponse quizStats(UUID quizId, UUID actorId) {
        authorizationService.ensureQuizOwner(quizId, actorId);
        long attempts = attemptRepository.countByQuizId(quizId);
        long submitted = attemptRepository.countByQuizIdAndStatus(quizId, AttemptStatus.SUBMITTED);
        long pass = attemptRepository.countByQuizIdAndPassed(quizId, true);
        long fail = attemptRepository.countByQuizIdAndPassed(quizId, false);
        return new QuizStatsResponse(
                attempts,
                submitted,
                zeroIfNull(attemptRepository.averageScoreForQuiz(quizId)),
                attemptRepository.highestScoreForQuiz(quizId),
                attemptRepository.lowestScoreForQuiz(quizId),
                pass,
                fail,
                rate(pass, submitted)
        );
    }

    private double zeroIfNull(Double value) {
        return value == null ? 0 : value;
    }

    private double rate(long count, long total) {
        return total == 0 ? 0 : (count * 100.0) / total;
    }
}
