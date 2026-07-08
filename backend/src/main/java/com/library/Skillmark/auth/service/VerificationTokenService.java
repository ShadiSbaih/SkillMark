package com.library.Skillmark.auth.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Service
public class VerificationTokenService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();

    private static final long VERIFICATION_EXPIRY_HOURS = 24;
    private static final long PASSWORD_RESET_EXPIRY_HOURS = 1;

    public Token generateEmailVerificationToken() {
        return new Token(generateToken(), Instant.now().plus(VERIFICATION_EXPIRY_HOURS, ChronoUnit.HOURS));
    }

    public Token generatePasswordResetToken() {
        return new Token(generateToken(), Instant.now().plus(PASSWORD_RESET_EXPIRY_HOURS, ChronoUnit.HOURS));
    }

    public boolean isValid(Token token) {
        return token != null
                && token.value() != null && !token.value().isBlank()
                && token.expiresAt() != null
                && token.expiresAt().isAfter(Instant.now());
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return ENCODER.encodeToString(bytes);
    }

    public record Token(String value, Instant expiresAt) {
    }
}
