package com.library.Skillmark.course.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request body for updating a course.")
public class UpdateCourseRequest {
    @NotBlank
    @Schema(description = "Updated course title.", example = "Advanced Spring Boot")
    private String title;

    @Schema(description = "Updated course description.", example = "Production-ready backend concepts")
    private String description;
}
