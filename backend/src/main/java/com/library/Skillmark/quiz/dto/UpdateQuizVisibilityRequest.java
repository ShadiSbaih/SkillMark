package com.library.Skillmark.quiz.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateQuizVisibilityRequest(@NotNull Boolean visibleToParticipants) {
}
