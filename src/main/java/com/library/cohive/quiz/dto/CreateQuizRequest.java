package com.library.cohive.quiz.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
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

    @NotNull
    @Min(0)
    @Builder.Default
    @Schema(description = "Minimum percentage required to pass.", example = "70")
    private Integer passingScore = 70;

    @NotNull
    @Builder.Default
    @Schema(description = "Whether students can attempt the quiz.", example = "true")
    private Boolean published = true;

    @Valid
    @Size(max = 50)
    @Builder.Default
    @Schema(description = "Multiple-choice questions for this quiz.")
    private List<CreateQuizQuestionRequest> questions = new ArrayList<>();

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Question to create inside a quiz.")
    public static class CreateQuizQuestionRequest {
        @NotBlank
        @Size(max = 1000)
        @Schema(example = "Which Spring component exposes HTTP endpoints?")
        private String questionText;

        @NotNull
        @Min(1)
        @Schema(example = "10")
        private Integer points;

        @NotNull
        @Min(1)
        @Schema(example = "1")
        private Integer displayOrder;

        @Valid
        @NotEmpty
        @Size(min = 2, max = 8)
        @Schema(description = "Possible answers. Exactly one should be correct.")
        private List<CreateQuizOptionRequest> options;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Option to create inside a quiz question.")
    public static class CreateQuizOptionRequest {
        @NotBlank
        @Size(max = 500)
        @Schema(example = "Controller")
        private String optionText;

        @NotNull
        @Schema(example = "true")
        private Boolean correct;

        @NotNull
        @Min(1)
        @Schema(example = "1")
        private Integer displayOrder;
    }
}
