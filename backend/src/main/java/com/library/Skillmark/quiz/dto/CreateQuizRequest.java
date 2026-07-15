package com.library.Skillmark.quiz.dto;

import com.library.Skillmark.quiz.enums.CertificateIssueMode;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateQuizRequest(
        @NotBlank String title,
        String description,
        @NotNull @Min(0) @jakarta.validation.constraints.Max(100) Integer passingScore,
        @NotNull @Min(1) Integer durationMinutes,
        @NotNull @Min(1) Integer maxAttempts,
        CertificateIssueMode certificateIssueMode
) {
}
