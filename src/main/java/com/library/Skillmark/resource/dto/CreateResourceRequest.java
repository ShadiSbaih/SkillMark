package com.library.Skillmark.resource.dto;

import com.library.Skillmark.resource.entity.ResourceType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
@Schema(description = "Request body for adding a course resource.")
public class CreateResourceRequest {
    @NotBlank
    @Size(max = 255)
    @Schema(description = "Resource title.", example = "Spring Docs")
    private String title;

    @NotNull
    @Schema(description = "Resource type. Current supported value is LINK.", example = "LINK")
    private ResourceType type;

    @NotBlank
    @Size(max = 2000)
    @Pattern(regexp = "https?://.+", message = "URL must start with http:// or https://")
    @Schema(description = "External resource URL. Must start with http:// or https://.", example = "https://spring.io")
    private String url;

    @NotNull
    @Schema(description = "Course that owns the resource.", format = "uuid")
    private UUID courseId;
}
