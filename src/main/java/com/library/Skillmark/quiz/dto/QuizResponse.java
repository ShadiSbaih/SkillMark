package com.library.Skillmark.quiz.dto;

import com.library.Skillmark.quiz.enums.CertificateIssueMode;
import com.library.Skillmark.quiz.enums.QuizStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record QuizResponse(
        UUID id,
        UUID programId,
        UUID organizationId,
        String title,
        String description,
        Integer passingScore,
        Integer durationMinutes,
        Integer maxAttempts,
        boolean certificateEnabled,
        CertificateIssueMode certificateIssueMode,
        boolean isPublished,
        QuizStatus status,
        Instant createdAt,
        List<QuestionResponse> questions
) {
}
