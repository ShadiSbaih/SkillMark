package com.library.Skillmark.stats.dto;

import java.math.BigDecimal;

public record QuizStatsResponse(
        long attemptsCount,
        long submittedAttempts,
        double averageScore,
        BigDecimal highestScore,
        BigDecimal lowestScore,
        long passCount,
        long failCount,
        double passRate
) {
}
