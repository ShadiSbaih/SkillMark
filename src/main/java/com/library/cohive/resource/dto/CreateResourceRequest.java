package com.library.cohive.resource.dto;

import com.library.cohive.resource.entity.ResourceType;
import com.library.cohive.resource.validation.ValidResourceUrl;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * Request payload for creating a course resource.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ValidResourceUrl
@Schema(name = "CreateResourceRequest", description = "Creates a URL-backed learning resource for a course.")
public class CreateResourceRequest {
    @NotBlank
    @Size(max = 255)
    @Schema(description = "Human-readable resource title.", example = "Spring Boot Reference Guide")
    private String title;

    @NotNull
    @Schema(description = "Resource classification that controls URL validation and API metadata.", example = "DOCUMENT")
    private ResourceType type;

    @NotBlank
    @Size(max = 2000)
    @Schema(
            description = "Absolute external URL. Only HTTP(S) URLs are currently supported.",
            example = "https://docs.spring.io/spring-boot/reference/"
    )
    private String url;

    @NotNull
    @Schema(description = "Owning course identifier.", format = "uuid")
    private UUID courseId;
}
