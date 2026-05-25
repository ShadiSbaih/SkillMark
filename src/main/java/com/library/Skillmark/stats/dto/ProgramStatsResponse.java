package com.library.Skillmark.stats.dto;

public record ProgramStatsResponse(
        long totalEnrollments,
        long activeEnrollments,
        long resourcesCount,
        long quizzesCount,
        long attemptsCount,
        long passedParticipants,
        long certificatesIssued,
        double averageScore
) {
}
