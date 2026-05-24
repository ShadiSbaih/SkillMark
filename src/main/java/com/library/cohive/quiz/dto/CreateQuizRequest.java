package com.library.cohive.quiz.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request body for creating a quiz.")
public class CreateQuizRequest {
    @NotBlank
    @Schema(description = "Quiz title.", example = "Java Quiz")
    private String title;

    @NotNull
    @Schema(description = "Course that owns the quiz.", format = "uuid")
    private UUID courseId;
}
