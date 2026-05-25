package com.library.Skillmark.quiz.dto;

import com.library.Skillmark.quiz.enums.CertificateIssueMode;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
public record CreateQuizRequest(
        @NotBlank String title,
        String description,
        @NotNull @DecimalMin("0.0") @DecimalMax("100.0") BigDecimal passingScore,
        @Min(1) Integer durationMinutes,
        @NotNull @Min(1) Integer maxAttempts,
        Boolean certificateEnabled,
        CertificateIssueMode certificateIssueMode
) {
}
