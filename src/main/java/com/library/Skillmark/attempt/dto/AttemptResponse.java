package com.library.Skillmark.attempt.dto;

import com.library.Skillmark.attempt.entity.QuizAttempt;
import com.library.Skillmark.attempt.enums.AttemptStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AttemptResponse(
        UUID attemptId,
        UUID quizId,
        UUID userId,
        BigDecimal score,
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
                attempt.getUser().getId(),
                attempt.getScore(),
                attempt.getScorePercentage(),
                attempt.getPassed(),
                attempt.getStatus(),
                attempt.getStartedAt(),
                attempt.getSubmittedAt()
        );
    }
}
