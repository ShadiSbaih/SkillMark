package com.library.Skillmark.stats.dto;

import java.util.UUID;

public record QuizQuestionStatsResponse(
        UUID questionId,
        String questionText,
        Integer position,
        Integer points,
        long totalAttempts,
        long correctCount,
        long incorrectCount,
        double correctRate
) {
}
