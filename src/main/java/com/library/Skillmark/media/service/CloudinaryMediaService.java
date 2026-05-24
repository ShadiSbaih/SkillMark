package com.library.Skillmark.media.service;

import com.library.Skillmark.common.exception.BusinessRuleException;
import com.library.Skillmark.media.dto.CloudinarySignatureResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
public class CloudinaryMediaService {
    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;

    public CloudinaryMediaService(@Value("${cloudinary.cloud-name:}") String cloudName,
                                  @Value("${cloudinary.api-key:}") String apiKey,
                                  @Value("${cloudinary.api-secret:}") String apiSecret) {
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    public String provider() {
        return "CLOUDINARY";
    }

    public CloudinarySignatureResponse signUpload(Map<String, String> params) {
        ensureConfigured();
        TreeMap<String, String> signedParams = new TreeMap<>();
        if (params != null) {
            params.forEach((key, value) -> {
                if (StringUtils.hasText(value) && !"file".equals(key) && !"api_key".equals(key) && !"signature".equals(key)) {
                    signedParams.put(key, value);
                }
            });
        }
        signedParams.putIfAbsent("timestamp", String.valueOf(Instant.now().getEpochSecond()));
        String payload = signedParams.entrySet().stream()
                .map(entry -> entry.getKey() + "=" + entry.getValue())
                .collect(Collectors.joining("&")) + apiSecret;
        return new CloudinarySignatureResponse(cloudName, apiKey,
                Long.parseLong(signedParams.get("timestamp")), sha1(payload), signedParams);
    }

    private void ensureConfigured() {
        if (!StringUtils.hasText(cloudName) || !StringUtils.hasText(apiKey) || !StringUtils.hasText(apiSecret)) {
            throw new BusinessRuleException("Cloudinary is not configured");
        }
    }

    private String sha1(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder();
            for (byte b : hash) {
                result.append(String.format("%02x", b));
            }
            return result.toString();
        } catch (Exception exception) {
            throw new BusinessRuleException("Unable to sign Cloudinary upload");
        }
    }
}
