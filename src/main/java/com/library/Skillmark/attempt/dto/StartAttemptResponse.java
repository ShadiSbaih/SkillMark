package com.library.Skillmark.attempt.dto;

import com.library.Skillmark.attempt.entity.QuizAttempt;
import com.library.Skillmark.attempt.enums.AttemptStatus;

import java.time.Instant;
import java.util.UUID;

public record StartAttemptResponse(UUID attemptId, UUID quizId, AttemptStatus status, Instant startedAt) {
    public static StartAttemptResponse from(QuizAttempt attempt) {
        return new StartAttemptResponse(attempt.getId(), attempt.getQuiz().getId(), attempt.getStatus(), attempt.getStartedAt());
    }
}
