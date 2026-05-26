package com.library.Skillmark.quiz.dto;

import com.library.Skillmark.quiz.enums.QuizStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateQuizStatusRequest(@NotNull QuizStatus status) {
}
