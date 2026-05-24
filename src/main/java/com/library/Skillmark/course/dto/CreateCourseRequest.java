package com.library.Skillmark.course.dto;

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
@Schema(description = "Request body for creating a course.")
public class CreateCourseRequest {
    @NotBlank
    @Schema(description = "Course title.", example = "Spring Boot Basics")
    private String title;

    @Schema(description = "Optional course description.", example = "Backend fundamentals")
    private String description;

    @NotNull
    @Schema(description = "Organization that owns the course.", format = "uuid")
    private UUID organizationId;
}
