package com.library.Skillmark.stats.service;

import com.library.Skillmark.attempt.enums.AttemptStatus;
import com.library.Skillmark.attempt.repository.QuizAttemptAnswerRepository;
import com.library.Skillmark.attempt.repository.QuizAttemptRepository;
import com.library.Skillmark.certificate.repository.CertificateRepository;
import com.library.Skillmark.enrollment.enums.EnrollmentStatus;
import com.library.Skillmark.enrollment.repository.ProgramEnrollmentRepository;
import com.library.Skillmark.program.repository.ProgramRepository;
import com.library.Skillmark.quiz.repository.QuizRepository;
import com.library.Skillmark.resource.enums.ResourceStatus;
import com.library.Skillmark.resource.repository.ProgramResourceRepository;
import com.library.Skillmark.security.service.AuthorizationService;
import com.library.Skillmark.stats.dto.*;
import com.library.Skillmark.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class StatsService {
    private static final int ANALYTICS_DAYS = 90;
    private static final DateTimeFormatter DAY_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneId.systemDefault());
    private static final DateTimeFormatter WEEK_FORMATTER = DateTimeFormatter.ofPattern("yyyy-'W'ww").withZone(ZoneId.systemDefault());

    private final ProgramRepository programRepository;
    private final CertificateRepository certificateRepository;
    private final ProgramEnrollmentRepository enrollmentRepository;
    private final ProgramResourceRepository resourceRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository attemptRepository;
    private final QuizAttemptAnswerRepository attemptAnswerRepository;
    private final AuthorizationService authorizationService;
    private final UserRepository userRepository;

    public StatsService(ProgramRepository programRepository,
                        CertificateRepository certificateRepository,
                        ProgramEnrollmentRepository enrollmentRepository,
                        ProgramResourceRepository resourceRepository,
                        QuizRepository quizRepository,
                        QuizAttemptRepository attemptRepository,
                        QuizAttemptAnswerRepository attemptAnswerRepository,
                        AuthorizationService authorizationService,
                        UserRepository userRepository) {
        this.programRepository = programRepository;
        this.certificateRepository = certificateRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.resourceRepository = resourceRepository;
        this.quizRepository = quizRepository;
        this.attemptRepository = attemptRepository;
        this.attemptAnswerRepository = attemptAnswerRepository;
        this.authorizationService = authorizationService;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public OrganizationStatsResponse globalStats(UUID actorId) {
        authorizationService.ensureAdmin(actorId);
        long attempts = attemptRepository.count();
        long passed = attemptRepository.countByPassed(true);
        return new OrganizationStatsResponse(
                programRepository.countByDeletedAtIsNull(),
                userRepository.count(),
                enrollmentRepository.countDistinctUsersByStatus(EnrollmentStatus.ACTIVE),
                quizRepository.countByDeletedAtIsNull(),
                attempts,
                certificateRepository.count(),
                zeroIfNull(attemptRepository.averageScore()),
                rate(passed, attempts),
                topPrograms()
        );
    }

    @Transactional(readOnly = true)
    public OrganizationStatsResponse organizationStats(UUID organizationId, UUID actorId) {
        return globalStats(actorId);
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

    @Transactional(readOnly = true)
    public List<QuizQuestionStatsResponse> quizQuestionStats(UUID quizId, UUID actorId) {
        authorizationService.ensureQuizOwner(quizId, actorId);
        List<Object[]> questionRows = attemptAnswerRepository.findQuestionStatsByQuizId(quizId);
        return questionRows.stream().map(row -> {
            UUID questionId = (UUID) row[0];
            String text = (String) row[1];
            Integer position = (Integer) row[2];
            Integer points = (Integer) row[3];
            long total = ((Number) row[4]).longValue();
            long correct = row[5] == null ? 0 : ((Number) row[5]).longValue();
            long incorrect = total - correct;
            double correctRate = total == 0 ? 0 : round((correct * 100.0) / total);
            return new QuizQuestionStatsResponse(questionId, text, position, points, total, correct, incorrect, correctRate);
        }).toList();
    }

    @Transactional(readOnly = true)
    public QuizScoreDistributionResponse quizScoreDistribution(UUID quizId, UUID actorId) {
        authorizationService.ensureQuizOwner(quizId, actorId);
        List<Object[]> rows = attemptRepository.scoreDistributionForQuiz(quizId);
        List<QuizScoreDistributionResponse.Bucket> result = new ArrayList<>();
        for (int min = 0; min <= 90; min += 10) {
            int max = min + 9;
            final int bucketMin = min;
            long count = rows.stream()
                    .filter(r -> ((Number) r[0]).intValue() == bucketMin)
                    .mapToLong(r -> ((Number) r[1]).longValue())
                    .sum();
            result.add(new QuizScoreDistributionResponse.Bucket(labelForRange(min, max), min, max, count));
        }
        long perfect = rows.stream()
                .filter(r -> ((Number) r[0]).intValue() == 100)
                .mapToLong(r -> ((Number) r[1]).longValue())
                .sum();
        result.add(new QuizScoreDistributionResponse.Bucket("100", 100, 100, perfect));
        return new QuizScoreDistributionResponse(result);
    }

    @Transactional(readOnly = true)
    public QuizAttemptTimelineResponse quizAttemptTimeline(UUID quizId, UUID actorId) {
        authorizationService.ensureQuizOwner(quizId, actorId);
        Instant end = Instant.now().truncatedTo(ChronoUnit.DAYS).plus(1, ChronoUnit.DAYS);
        Instant start = end.minus(ANALYTICS_DAYS, ChronoUnit.DAYS);
        return new QuizAttemptTimelineResponse(
                mapAttemptBuckets(attemptRepository.dailyTimelineForQuiz(quizId, start, end), DAY_FORMATTER),
                mapAttemptBuckets(attemptRepository.weeklyTimelineForQuiz(quizId, start, end), WEEK_FORMATTER)
        );
    }

    @Transactional(readOnly = true)
    public ProgramEnrollmentTimelineResponse programEnrollmentTimeline(UUID programId, UUID actorId) {
        authorizationService.ensureProgramOwner(programId, actorId);
        Instant end = Instant.now().truncatedTo(ChronoUnit.DAYS).plus(1, ChronoUnit.DAYS);
        Instant start = end.minus(ANALYTICS_DAYS, ChronoUnit.DAYS);
        return new ProgramEnrollmentTimelineResponse(
                mapEnrollmentBuckets(enrollmentRepository.dailyEnrollmentTimelineForProgram(programId, start, end), DAY_FORMATTER),
                mapEnrollmentBuckets(enrollmentRepository.weeklyEnrollmentTimelineForProgram(programId, start, end), WEEK_FORMATTER)
        );
    }

    @Transactional(readOnly = true)
    public ProgramCompletionStatsResponse programCompletionStats(UUID programId, UUID actorId) {
        authorizationService.ensureProgramOwner(programId, actorId);
        long totalEnrollments = enrollmentRepository.countByProgramId(programId);
        long activeEnrollments = enrollmentRepository.countByProgramIdAndStatus(programId, EnrollmentStatus.ACTIVE);
        long completedEnrollments = enrollmentRepository.countCompletedByProgramId(programId);
        long attemptedQuizzes = attemptRepository.distinctParticipantsWithAttemptsForProgram(programId);
        long passedQuizzes = attemptRepository.distinctParticipantsPassedForProgram(programId);
        long certificatesIssued = certificateRepository.countByProgramId(programId);
        return new ProgramCompletionStatsResponse(
                totalEnrollments,
                activeEnrollments,
                completedEnrollments,
                attemptedQuizzes,
                passedQuizzes,
                certificatesIssued,
                rate(attemptedQuizzes, totalEnrollments),
                rate(passedQuizzes, attemptedQuizzes),
                rate(certificatesIssued, totalEnrollments)
        );
    }

    @Transactional(readOnly = true)
    public OrganizationCertificatesTimelineResponse globalCertificateTimeline(UUID actorId) {
        authorizationService.ensureAdmin(actorId);
        Instant end = Instant.now().truncatedTo(ChronoUnit.DAYS).plus(1, ChronoUnit.DAYS);
        Instant start = end.minus(ANALYTICS_DAYS, ChronoUnit.DAYS);
        return new OrganizationCertificatesTimelineResponse(
                mapCertificateBuckets(certificateRepository.dailyCertificateTimeline(start, end), DAY_FORMATTER),
                mapCertificateBuckets(certificateRepository.weeklyCertificateTimeline(start, end), WEEK_FORMATTER)
        );
    }

    @Transactional(readOnly = true)
    public OrganizationCertificatesTimelineResponse organizationCertificateTimeline(UUID organizationId, UUID actorId) {
        return globalCertificateTimeline(actorId);
    }

    private List<TopProgramResponse> topPrograms() {
        return certificateRepository.topProgramsByEnrollments().stream().map(row -> {
            UUID programId = (UUID) row[0];
            String title = (String) row[1];
            long enrollments = row[2] == null ? 0 : ((Number) row[2]).longValue();
            long certificates = row[3] == null ? 0 : ((Number) row[3]).longValue();
            double averageScore = zeroIfNull(row[4] == null ? null : ((Number) row[4]).doubleValue());
            long passedAttempts = row[5] == null ? 0 : ((Number) row[5]).longValue();
            return new TopProgramResponse(programId, title, enrollments, certificates, averageScore, rate(passedAttempts, enrollments));
        }).limit(5).toList();
    }

    private List<QuizAttemptTimelineResponse.Bucket> mapAttemptBuckets(List<Object[]> rows, DateTimeFormatter formatter) {
        return rows.stream().map(r -> new QuizAttemptTimelineResponse.Bucket(
                formatTimestamp(r[0], formatter),
                r[1] == null ? 0 : ((Number) r[1]).longValue(),
                r[2] == null ? 0 : ((Number) r[2]).longValue(),
                r[3] == null ? 0 : ((Number) r[3]).longValue()
        )).toList();
    }

    private List<ProgramEnrollmentTimelineResponse.Bucket> mapEnrollmentBuckets(List<Object[]> rows, DateTimeFormatter formatter) {
        return rows.stream().map(r -> new ProgramEnrollmentTimelineResponse.Bucket(
                formatTimestamp(r[0], formatter),
                r[1] == null ? 0 : ((Number) r[1]).longValue(),
                r[2] == null ? 0 : ((Number) r[2]).longValue(),
                r[3] == null ? 0 : ((Number) r[3]).longValue()
        )).toList();
    }

    private List<OrganizationCertificatesTimelineResponse.Bucket> mapCertificateBuckets(List<Object[]> rows, DateTimeFormatter formatter) {
        return rows.stream().map(r -> new OrganizationCertificatesTimelineResponse.Bucket(
                formatTimestamp(r[0], formatter),
                r[1] == null ? 0 : ((Number) r[1]).longValue(),
                r[2] == null ? 0 : ((Number) r[2]).longValue()
        )).toList();
    }

    private String formatTimestamp(Object value, DateTimeFormatter formatter) {
        if (value == null) {
            return "";
        }
        if (value instanceof Timestamp ts) {
            return formatter.format(ts.toInstant());
        }
        if (value instanceof Instant instant) {
            return formatter.format(instant);
        }
        if (value instanceof java.util.Date date) {
            return formatter.format(date.toInstant());
        }
        return value.toString();
    }

    private String labelForRange(int min, int max) {
        return min == max ? String.valueOf(min) : min + "-" + max;
    }

    private double zeroIfNull(Double value) {
        return value == null ? 0 : value;
    }

    private double rate(long count, long total) {
        return total == 0 ? 0 : (count * 100.0) / total;
    }

    private double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
