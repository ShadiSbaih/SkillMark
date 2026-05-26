package com.library.Skillmark.attempt.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SubmitAnswerRequest(@NotNull UUID questionId, @NotNull UUID selectedOptionId) {
}
