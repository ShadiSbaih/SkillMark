package com.library.Skillmark.attempt.dto;

import com.library.Skillmark.attempt.entity.QuizAttempt;
import com.library.Skillmark.attempt.enums.AttemptStatus;

import java.time.Instant;
import java.util.UUID;

public record StartAttemptResponse(
        UUID attemptId,
        UUID quizId,
        Integer attemptNumber,
        AttemptStatus status,
        Instant startedAt,
        Instant expiresAt
) {
    public static StartAttemptResponse from(QuizAttempt attempt) {
        return new StartAttemptResponse(
                attempt.getId(),
                attempt.getQuiz().getId(),
                attempt.getAttemptNumber(),
                attempt.getStatus(),
                attempt.getStartedAt(),
                attempt.getExpiresAt()
        );
    }
}
