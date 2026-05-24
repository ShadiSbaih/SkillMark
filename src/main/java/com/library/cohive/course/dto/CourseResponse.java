package com.library.cohive.course.dto;

import com.library.cohive.course.entity.Course;
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
public class CourseResponse {
    private UUID id;
    private String title;
    private String description;
    private UUID organizationId;
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
