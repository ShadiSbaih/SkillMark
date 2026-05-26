package com.library.Skillmark.storage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record R2UploadUrlRequest(@NotNull UUID programId, @NotBlank String objectKey, String contentType) {
}
