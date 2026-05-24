package com.library.cohive.quiz.dto;

import com.library.cohive.quiz.entity.Quiz;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Quiz returned by the API.")
public class QuizResponse {
    @Schema(format = "uuid")
    private UUID id;

    @Schema(example = "Java Quiz")
    private String title;

    @Schema(format = "uuid")
    private UUID courseId;

    @Schema(example = "70")
    private Integer passingScore;

    @Schema(example = "true")
    private Boolean published;

    private List<QuizQuestionResponse> questions;

    @Schema(format = "date-time")
    private Instant createdAt;

    public static QuizResponse fromEntity(Quiz quiz) {
        if (quiz == null) {
            return null;
        }
        return QuizResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .courseId(quiz.getCourse().getId())
                .passingScore(quiz.getPassingScore())
                .published(quiz.getPublished())
                .questions(quiz.getQuestions().stream()
                        .sorted(Comparator.comparing(question -> question.getDisplayOrder()))
                        .map(QuizQuestionResponse::fromEntity)
                        .toList())
                .createdAt(quiz.getCreatedAt())
                .build();
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Quiz question returned by the API.")
    public static class QuizQuestionResponse {
        @Schema(format = "uuid")
        private UUID id;

        private String questionText;

        private Integer points;

        private Integer displayOrder;

        private List<QuizOptionResponse> options;

        public static QuizQuestionResponse fromEntity(com.library.cohive.quiz.entity.QuizQuestion question) {
            return QuizQuestionResponse.builder()
                    .id(question.getId())
                    .questionText(question.getQuestionText())
                    .points(question.getPoints())
                    .displayOrder(question.getDisplayOrder())
                    .options(question.getOptions().stream()
                            .sorted(Comparator.comparing(option -> option.getDisplayOrder()))
                            .map(QuizOptionResponse::fromEntity)
                            .toList())
                    .build();
        }
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Quiz option returned by the API.")
    public static class QuizOptionResponse {
        @Schema(format = "uuid")
        private UUID id;

        private String optionText;

        private Integer displayOrder;

        public static QuizOptionResponse fromEntity(com.library.cohive.quiz.entity.QuizOption option) {
            return QuizOptionResponse.builder()
                    .id(option.getId())
                    .optionText(option.getOptionText())
                    .displayOrder(option.getDisplayOrder())
                    .build();
        }
    }
}
