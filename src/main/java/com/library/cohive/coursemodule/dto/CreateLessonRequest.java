package com.library.cohive.coursemodule.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
@Schema(description = "Request body for creating a lesson.")
public class CreateLessonRequest {
    @NotBlank
    @Size(max = 255)
    @Schema(example = "Project Setup")
    private String title;

    @NotBlank
    @Size(max = 4000)
    @Schema(example = "Prepare a Spring Boot API project.")
    private String content;

    @Size(max = 2000)
    @Pattern(regexp = "^$|https?://.+", message = "Resource URL must start with http:// or https://")
    @Schema(example = "https://spring.io/guides")
    private String resourceUrl;

    @NotNull
    @Min(1)
    @Schema(example = "1")
    private Integer displayOrder;
}
