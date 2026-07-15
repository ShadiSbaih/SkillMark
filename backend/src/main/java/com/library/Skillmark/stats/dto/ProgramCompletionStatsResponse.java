package com.library.Skillmark.stats.dto;

public record ProgramCompletionStatsResponse(
        long totalEnrollments,
        long activeEnrollments,
        long completedEnrollments,
        long attemptedQuizzes,
        long passedQuizzes,
        long certificatesIssued,
        double enrollmentToAttemptRate,
        double attemptToPassRate,
        double enrollmentToCertificateRate
) {
}
