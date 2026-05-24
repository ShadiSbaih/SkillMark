package com.library.cohive.quiz.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request body for submitting a quiz attempt.")
public class SubmitQuizAttemptRequest {
    @Valid
    @NotEmpty
    private List<AnswerRequest> answers;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerRequest {
        @NotNull
        @Schema(format = "uuid")
        private UUID questionId;

        @NotNull
        @Schema(format = "uuid")
        private UUID selectedOptionId;
    }
}
