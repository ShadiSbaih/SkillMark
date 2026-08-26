package com.library.Skillmark.attempt.dto;

import com.library.Skillmark.attempt.entity.QuizAttempt;
import com.library.Skillmark.attempt.enums.AttemptStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AttemptResponse(
        UUID attemptId,
        UUID quizId,
        String quizTitle,
        UUID userId,
        Integer attemptNumber,
        Instant expiresAt,
        Integer totalPoints,
        Integer earnedPoints,
        BigDecimal scorePercentage,
        Boolean passed,
        AttemptStatus status,
        Instant startedAt,
        Instant submittedAt
) {
    public static AttemptResponse from(QuizAttempt attempt) {
        return new AttemptResponse(
                attempt.getId(),
                attempt.getQuiz().getId(),
                attempt.getQuiz().getTitle(),
                attempt.getUser().getId(),
                attempt.getAttemptNumber(),
                attempt.getExpiresAt(),
                attempt.getTotalPoints(),
                attempt.getEarnedPoints(),
                attempt.getScorePercentage(),
                attempt.getPassed(),
                attempt.getStatus(),
                attempt.getStartedAt(),
                attempt.getSubmittedAt()
        );
    }
}
