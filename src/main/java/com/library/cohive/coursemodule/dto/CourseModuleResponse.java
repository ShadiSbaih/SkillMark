package com.library.cohive.coursemodule.dto;

import com.library.cohive.coursemodule.entity.CourseModule;
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
@Schema(description = "Course module returned by the API.")
public class CourseModuleResponse {
    @Schema(format = "uuid")
    private UUID id;

    private String title;

    private Integer displayOrder;

    @Schema(format = "uuid")
    private UUID courseId;

    private List<LessonResponse> lessons;

    @Schema(format = "date-time")
    private Instant createdAt;

    public static CourseModuleResponse fromEntity(CourseModule module) {
        if (module == null) {
            return null;
        }
        return CourseModuleResponse.builder()
                .id(module.getId())
                .title(module.getTitle())
                .displayOrder(module.getDisplayOrder())
                .courseId(module.getCourse().getId())
                .lessons(module.getLessons().stream()
                        .sorted(Comparator.comparing(lesson -> lesson.getDisplayOrder()))
                        .map(LessonResponse::fromEntity)
                        .toList())
                .createdAt(module.getCreatedAt())
                .build();
    }
}
