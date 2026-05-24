package com.library.cohive.quiz.dto;

import com.library.cohive.quiz.entity.QuizAttempt;
import com.library.cohive.quiz.entity.QuizAttemptAnswer;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Quiz attempt result returned by the API.")
public class QuizAttemptResponse {
    @Schema(format = "uuid")
    private UUID id;

    @Schema(format = "uuid")
    private UUID quizId;

    @Schema(format = "uuid")
    private UUID studentId;

    private Integer score;

    private Integer maxScore;

    private BigDecimal percentage;

    private Boolean passed;

    @Schema(format = "date-time")
    private Instant submittedAt;

    private List<AnswerResultResponse> answers;

    public static QuizAttemptResponse fromEntity(QuizAttempt attempt) {
        return QuizAttemptResponse.builder()
                .id(attempt.getId())
                .quizId(attempt.getQuiz().getId())
                .studentId(attempt.getStudent().getId())
                .score(attempt.getScore())
                .maxScore(attempt.getMaxScore())
                .percentage(attempt.getPercentage())
                .passed(attempt.getPassed())
                .submittedAt(attempt.getSubmittedAt())
                .answers(attempt.getAnswers().stream()
                        .sorted(Comparator.comparing(answer -> answer.getQuestion().getDisplayOrder()))
                        .map(AnswerResultResponse::fromEntity)
                        .toList())
                .build();
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerResultResponse {
        @Schema(format = "uuid")
        private UUID questionId;

        private String questionText;

        @Schema(format = "uuid")
        private UUID selectedOptionId;

        private String selectedOptionText;

        @Schema(format = "uuid")
        private UUID correctOptionId;

        private String correctOptionText;

        private Boolean correct;

        private Integer pointsAwarded;

        private Integer pointsPossible;

        public static AnswerResultResponse fromEntity(QuizAttemptAnswer answer) {
            var correctOption = answer.getQuestion().getOptions().stream()
                    .filter(option -> Boolean.TRUE.equals(option.getCorrect()))
                    .findFirst()
                    .orElse(null);
            return AnswerResultResponse.builder()
                    .questionId(answer.getQuestion().getId())
                    .questionText(answer.getQuestion().getQuestionText())
                    .selectedOptionId(answer.getSelectedOption().getId())
                    .selectedOptionText(answer.getSelectedOption().getOptionText())
                    .correctOptionId(correctOption != null ? correctOption.getId() : null)
                    .correctOptionText(correctOption != null ? correctOption.getOptionText() : null)
                    .correct(answer.getCorrect())
                    .pointsAwarded(answer.getPointsAwarded())
                    .pointsPossible(answer.getQuestion().getPoints())
                    .build();
        }
    }
}
