package com.library.cohive.course.dto;

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
@Schema(name = "UpdateCourseRequest", description = "Updates mutable course attributes.")
public class UpdateCourseRequest {
    @NotBlank
    @Schema(description = "Updated course title.", example = "Advanced Spring Boot")
    private String title;

    @Schema(description = "Updated optional course summary.", example = "Production-focused backend engineering", nullable = true)
    private String description;
}
