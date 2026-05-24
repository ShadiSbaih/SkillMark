package com.library.cohive.quiz.dto;

import com.library.cohive.quiz.entity.Quiz;
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
public class QuizResponse {
    private UUID id;
    private String title;
    private UUID courseId;
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
