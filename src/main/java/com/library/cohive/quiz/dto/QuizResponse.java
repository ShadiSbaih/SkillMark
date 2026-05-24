package com.library.cohive.quiz.dto;

import com.library.cohive.quiz.entity.Quiz;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(name = "QuizResponse", description = "Quiz details returned by the API.")
public class QuizResponse {
    @Schema(format = "uuid")
    private UUID id;

    @Schema(example = "Java Quiz")
    private String title;

    @Schema(format = "uuid")
    private UUID courseId;

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
                .createdAt(quiz.getCreatedAt())
                .build();
    }
}
