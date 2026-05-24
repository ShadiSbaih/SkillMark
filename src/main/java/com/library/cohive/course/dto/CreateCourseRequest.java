package com.library.cohive.course.dto;

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
@Schema(name = "CreateCourseRequest", description = "Creates a course under an organization owned by the authenticated user.")
public class CreateCourseRequest {
    @NotBlank
    @Schema(description = "Course title.", example = "Spring Boot Basics")
    private String title;

    @Schema(description = "Optional course summary shown to students.", example = "Backend fundamentals", nullable = true)
    private String description;

    @NotNull
    @Schema(description = "Owning organization identifier.", format = "uuid")
    private UUID organizationId;
}
