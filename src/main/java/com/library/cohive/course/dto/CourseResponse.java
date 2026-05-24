package com.library.cohive.course.dto;

import com.library.cohive.course.entity.Course;
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
@Schema(description = "Course details returned by the API.")
public class CourseResponse {
    @Schema(format = "uuid")
    private UUID id;

    @Schema(example = "Spring Boot Basics")
    private String title;

    @Schema(example = "Backend fundamentals")
    private String description;

    @Schema(format = "uuid")
    private UUID organizationId;

    @Schema(format = "date-time")
    private Instant createdAt;

    public static CourseResponse fromEntity(Course course) {
        if (course == null) {
            return null;
        }
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .organizationId(course.getOrganization().getId())
                .createdAt(course.getCreatedAt())
                .build();
    }
}
