package com.library.Skillmark.attempt.dto;

import com.library.Skillmark.attempt.enums.AttemptStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AttemptResultResponse(
        UUID attemptId,
        Integer totalPoints,
        Integer earnedPoints,
        BigDecimal scorePercentage,
        boolean passed,
        AttemptStatus status,
        Instant submittedAt,
        boolean certificateIssued,
        UUID certificateId
) {
}
