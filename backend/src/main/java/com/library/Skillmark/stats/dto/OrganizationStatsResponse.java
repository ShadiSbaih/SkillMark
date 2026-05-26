package com.library.Skillmark.stats.dto;

public record OrganizationStatsResponse(
        long totalPrograms,
        long totalMembers,
        long totalEnrolledParticipants,
        long totalQuizzes,
        long totalAttempts,
        long totalCertificates,
        double averageScore,
        double passRate
) {
}
