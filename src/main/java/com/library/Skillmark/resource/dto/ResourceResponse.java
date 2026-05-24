package com.library.Skillmark.resource.dto;

import com.library.Skillmark.resource.entity.Resource;
import com.library.Skillmark.resource.entity.ResourceType;
import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Course resource returned by the API.")
public class ResourceResponse {
    @Schema(format = "uuid")
    private UUID id;

    @Schema(example = "Spring Docs")
    private String title;

    @Schema(example = "LINK")
    private ResourceType type;

    @Schema(example = "https://spring.io")
    private String url;

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
                .url(resource.getUrl())
                .courseId(resource.getCourse().getId())
                .createdAt(resource.getCreatedAt())
                .build();
    }
}
