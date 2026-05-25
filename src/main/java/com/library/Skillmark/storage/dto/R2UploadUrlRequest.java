package com.library.Skillmark.storage.dto;

import jakarta.validation.constraints.NotBlank;

public record R2UploadUrlRequest(@NotBlank String objectKey, String contentType) {
}
