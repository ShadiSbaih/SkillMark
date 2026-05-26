package com.library.Skillmark.enrollment.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateEnrollmentRequest(@NotNull UUID userId) {
}
