package com.library.Skillmark.certificate.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record IssueCertificateRequest(@NotNull UUID quizId, @NotNull UUID userId, @NotNull UUID attemptId, String title) {
}
