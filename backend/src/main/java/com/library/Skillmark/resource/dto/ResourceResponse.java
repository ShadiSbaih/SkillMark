package com.library.Skillmark.resource.dto;

import com.library.Skillmark.resource.entity.ProgramResource;
import com.library.Skillmark.resource.enums.ResourceStatus;
import com.library.Skillmark.resource.enums.ResourceType;
import com.library.Skillmark.resource.enums.StorageProvider;

import java.time.Instant;
import java.util.UUID;

public record ResourceResponse(
        UUID id,
        UUID programId,
        String title,
        String description,
        ResourceType type,
        String url,
        StorageProvider storageProvider,
        String objectKey,
        boolean visibleToParticipants,
        ResourceStatus status,
        int position,
        Instant createdAt
) {
    public static ResourceResponse from(ProgramResource resource) {
        return new ResourceResponse(
                resource.getId(),
                resource.getProgram().getId(),
                resource.getTitle(),
                resource.getDescription(),
                resource.getType(),
                resource.getUrl(),
                resource.getStorageProvider(),
                resource.getObjectKey(),
                resource.isVisibleToParticipants(),
                resource.getStatus(),
                resource.getPosition(),
                resource.getCreatedAt()
        );
    }
}
