package com.library.Skillmark.security.clerk;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.Skillmark.common.exception.BadRequestException;
import com.library.Skillmark.common.exception.UnauthorizedException;
import com.library.Skillmark.user.entity.User;
import com.library.Skillmark.user.enums.UserStatus;
import com.library.Skillmark.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Optional;

@Service
public class ClerkWebhookService {
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final String webhookSecret;

    public ClerkWebhookService(UserRepository userRepository,
                               ObjectMapper objectMapper,
                               @Value("${clerk.webhook-secret:}") String webhookSecret) {
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.webhookSecret = webhookSecret;
    }

    @Transactional
    public void handle(String payload, String svixId, String svixTimestamp, String svixSignature) {
        verifySignature(payload, svixId, svixTimestamp, svixSignature);
        JsonNode root = parse(payload);
        String type = text(root, "type");
        JsonNode data = root.path("data");
        String clerkUserId = text(data, "id");
        if (!StringUtils.hasText(type) || !StringUtils.hasText(clerkUserId)) {
            throw new BadRequestException("Invalid Clerk webhook payload");
        }

        if ("user.deleted".equals(type)) {
            userRepository.findByClerkUserId(clerkUserId).ifPresent(user -> user.setStatus(UserStatus.DELETED));
            return;
        }

        if ("user.created".equals(type) || "user.updated".equals(type)) {
            ClerkWebhookUser incoming = toUser(data);
            User user = userRepository.findByClerkUserId(clerkUserId)
                    .or(() -> StringUtils.hasText(incoming.email()) ? userRepository.findByEmailIgnoreCase(incoming.email()) : Optional.empty())
                    .orElseGet(User::new);
            if (user.getClerkUserId() == null) {
                user.setClerkUserId(clerkUserId);
            }
            user.setName(incoming.name());
            user.setEmail(incoming.email());
            user.setAvatarUrl(incoming.avatarUrl());
            user.setStatus(UserStatus.ACTIVE);
            userRepository.save(user);
        }
    }

    private void verifySignature(String payload, String svixId, String svixTimestamp, String svixSignature) {
        if (!StringUtils.hasText(webhookSecret)) {
            throw new UnauthorizedException("Clerk webhook secret is not configured");
        }
        if (!StringUtils.hasText(svixId) || !StringUtils.hasText(svixTimestamp) || !StringUtils.hasText(svixSignature)) {
            throw new UnauthorizedException("Missing Clerk webhook signature");
        }
        String signedContent = svixId + "." + svixTimestamp + "." + payload;
        byte[] expected = hmacSha256(secretBytes(), signedContent);
        for (String part : svixSignature.split(" ")) {
            String[] versionAndSignature = part.split(",", 2);
            if (versionAndSignature.length == 2 && "v1".equals(versionAndSignature[0])) {
                byte[] actual = Base64.getDecoder().decode(versionAndSignature[1]);
                if (MessageDigest.isEqual(expected, actual)) {
                    return;
                }
            }
        }
        throw new UnauthorizedException("Invalid Clerk webhook signature");
    }

    private byte[] secretBytes() {
        String value = webhookSecret.startsWith("whsec_") ? webhookSecret.substring("whsec_".length()) : webhookSecret;
        try {
            return Base64.getDecoder().decode(value);
        } catch (IllegalArgumentException ex) {
            return webhookSecret.getBytes(StandardCharsets.UTF_8);
        }
    }

    private byte[] hmacSha256(byte[] secret, String content) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return mac.doFinal(content.getBytes(StandardCharsets.UTF_8));
        } catch (Exception ex) {
            throw new UnauthorizedException("Unable to verify Clerk webhook signature");
        }
    }

    private JsonNode parse(String payload) {
        try {
            return objectMapper.readTree(payload);
        } catch (Exception ex) {
            throw new BadRequestException("Invalid Clerk webhook JSON");
        }
    }

    private ClerkWebhookUser toUser(JsonNode data) {
        String clerkUserId = text(data, "id");
        String email = primaryEmail(data);
        if (!StringUtils.hasText(email)) {
            email = clerkUserId + "@clerk.local";
        }
        String name = fullName(data);
        if (!StringUtils.hasText(name)) {
            name = email;
        }
        return new ClerkWebhookUser(name, email, text(data, "image_url"));
    }

    private String primaryEmail(JsonNode data) {
        String primaryEmailId = text(data, "primary_email_address_id");
        for (JsonNode emailNode : data.path("email_addresses")) {
            if (!StringUtils.hasText(primaryEmailId) || primaryEmailId.equals(text(emailNode, "id"))) {
                return text(emailNode, "email_address");
            }
        }
        return null;
    }

    private String fullName(JsonNode data) {
        String first = text(data, "first_name");
        String last = text(data, "last_name");
        return ((first == null ? "" : first) + " " + (last == null ? "" : last)).trim();
    }

    private String text(JsonNode node, String field) {
        JsonNode value = node.path(field);
        return value.isMissingNode() || value.isNull() ? null : value.asText();
    }

    private record ClerkWebhookUser(String name, String email, String avatarUrl) {
    }
}
