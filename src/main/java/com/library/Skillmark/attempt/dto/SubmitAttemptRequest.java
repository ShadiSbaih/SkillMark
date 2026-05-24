package com.library.Skillmark.attempt.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SubmitAttemptRequest(@NotEmpty @Valid List<SubmitAnswerRequest> answers) {
}
