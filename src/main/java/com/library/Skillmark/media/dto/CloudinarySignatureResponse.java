package com.library.Skillmark.media.dto;

import java.util.Map;

public record CloudinarySignatureResponse(String cloudName, String apiKey, long timestamp, String signature, Map<String, String> signedParams) {
}
