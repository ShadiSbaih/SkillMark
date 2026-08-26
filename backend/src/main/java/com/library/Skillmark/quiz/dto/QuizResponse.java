package com.library.Skillmark.quiz.dto;

import com.library.Skillmark.quiz.enums.CertificateIssueMode;
import com.library.Skillmark.quiz.enums.QuizStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record QuizResponse(
        UUID id,
        UUID programId,
        String title,
        String description,
        Integer passingScore,
        Integer durationMinutes,
        Integer maxAttempts,
        CertificateIssueMode certificateIssueMode,
        boolean visibleToParticipants,
        @Schema(description = "Compatibility field derived from status == PUBLISHED. Do not treat as an independent state.")
        boolean isPublished,
        QuizStatus status,
        Instant createdAt,
        List<QuestionResponse> questions
) {
}
