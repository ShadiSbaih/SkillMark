package com.library.Skillmark.stats.dto;

import java.util.List;

public record GlobalStatsResponse(
        long totalPrograms,
        long totalMembers,
        long totalEnrolledParticipants,
        long totalQuizzes,
        long totalAttempts,
        long totalCertificates,
        double averageScore,
        double passRate,
        List<TopProgramResponse> topPrograms
) {
}
