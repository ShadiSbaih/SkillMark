package com.library.Skillmark.quiz.dto;

import com.library.Skillmark.quiz.enums.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record CreateQuestionRequest(
        @NotBlank String text,
        @NotNull QuestionType type,
        @NotNull @DecimalMin(value = "0.01") BigDecimal points,
        @NotNull @Min(1) Integer position,
        @NotEmpty @Valid List<CreateOptionRequest> options
) {
}
