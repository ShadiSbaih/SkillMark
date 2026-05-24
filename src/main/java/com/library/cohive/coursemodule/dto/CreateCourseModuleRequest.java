package com.library.cohive.coursemodule.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
@Schema(description = "Request body for creating a course module.")
public class CreateCourseModuleRequest {
    @NotBlank
    @Size(max = 255)
    @Schema(example = "Backend Foundations")
    private String title;

    @NotNull
    @Min(1)
    @Schema(example = "1")
    private Integer displayOrder;
}
