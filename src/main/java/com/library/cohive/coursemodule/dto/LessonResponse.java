package com.library.cohive.coursemodule.dto;

import com.library.cohive.coursemodule.entity.Lesson;
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
@Schema(description = "Lesson returned by the API.")
public class LessonResponse {
    @Schema(format = "uuid")
    private UUID id;

    private String title;

    private String content;

    private String resourceUrl;

    private Integer displayOrder;

    @Schema(format = "date-time")
    private Instant createdAt;

    public static LessonResponse fromEntity(Lesson lesson) {
        if (lesson == null) {
            return null;
        }
        return LessonResponse.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .content(lesson.getContent())
                .resourceUrl(lesson.getResourceUrl())
                .displayOrder(lesson.getDisplayOrder())
                .createdAt(lesson.getCreatedAt())
                .build();
    }
}
