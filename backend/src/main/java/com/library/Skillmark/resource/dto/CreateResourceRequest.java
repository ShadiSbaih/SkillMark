package com.library.Skillmark.resource.dto;

import com.library.Skillmark.resource.enums.ResourceType;
import com.library.Skillmark.resource.enums.StorageProvider;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateResourceRequest(
        @NotBlank String title,
        String description,
        @NotNull ResourceType type,
        String url,
        StorageProvider storageProvider,
        String objectKey,
        @Min(0) int position
) {
}
