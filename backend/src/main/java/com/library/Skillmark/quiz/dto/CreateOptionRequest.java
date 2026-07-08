package com.library.Skillmark.quiz.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateOptionRequest(@NotBlank String text, boolean isCorrect, @NotNull @Min(0) Integer position) {
}
