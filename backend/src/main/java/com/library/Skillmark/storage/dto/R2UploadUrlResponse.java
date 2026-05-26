package com.library.Skillmark.storage.dto;

import java.time.Instant;

public record R2UploadUrlResponse(String uploadUrl, String objectKey, String publicUrl, Instant expiresAt) {
}
