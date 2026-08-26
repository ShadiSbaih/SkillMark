package com.library.Skillmark.media.dto;

import java.util.Map;
import java.util.UUID;

public record CloudinarySignatureRequest(UUID programId, Map<String, String> params) {
}
