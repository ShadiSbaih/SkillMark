package com.library.cohive.resource.dto;

import com.library.cohive.resource.entity.Resource;
import com.library.cohive.resource.entity.ResourceCategory;
import com.library.cohive.resource.entity.ResourceType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * API representation of a course resource.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(name = "ResourceResponse", description = "Resource details returned by the API.")
public class ResourceResponse {
    @Schema(format = "uuid")
    private UUID id;

    @Schema(example = "Spring Boot Reference Guide")
    private String title;

    @Schema(example = "DOCUMENT")
    private ResourceType type;

    @Schema(example = "Document")
    private String typeDisplayName;

    @Schema(example = "Document-style material referenced through an external URL.")
    private String typeDescription;

    @Schema(description = "Broad category used to group related resource types.", example = "LEARNING_CONTENT")
    private ResourceCategory typeCategory;

    @Schema(example = "URL must be absolute and use one of: http, https")
    private String typeValidationRule;

    @Schema(example = "https://docs.spring.io/spring-boot/reference/")
    private String url;

    @Schema(description = "Whether the client can safely render an inline preview.", example = "true")
    private boolean previewable;

    @Schema(description = "Whether the resource is expected to be downloadable.", example = "true")
    private boolean downloadable;

    @Schema(description = "Allowed URI schemes for the selected type.")
    private List<String> allowedUrlSchemes;

    @Schema(format = "uuid")
    private UUID courseId;

    @Schema(format = "date-time")
    private Instant createdAt;

    public static ResourceResponse fromEntity(Resource resource) {
        if (resource == null) {
            return null;
        }
        return ResourceResponse.builder()
                .id(resource.getId())
                .title(resource.getTitle())
                .type(resource.getType())
                .typeDisplayName(resource.getType().getDisplayName())
                .typeDescription(resource.getType().getDescription())
                .typeCategory(resource.getType().getCategory())
                .typeValidationRule(resource.getType().getValidationRule())
                .url(resource.getUrl().toString())
                .previewable(resource.getType().isPreviewable())
                .downloadable(resource.getType().isDownloadable())
                .allowedUrlSchemes(resource.getType().getAllowedSchemes().stream().sorted().toList())
                .courseId(resource.getCourse().getId())
                .createdAt(resource.getCreatedAt())
                .build();
    }
}
