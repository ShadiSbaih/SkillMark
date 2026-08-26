package com.library.Skillmark.auth.service;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class VerificationTokenServiceTest {

    private final VerificationTokenService service = new VerificationTokenService();

    @Test
    void shouldGenerateNonBlankVerificationToken() {
        VerificationTokenService.Token token = service.generateEmailVerificationToken();

        assertThat(token.value()).isNotBlank();
        assertThat(token.expiresAt()).isAfter(Instant.now());
    }

    @Test
    void shouldGenerateNonBlankPasswordResetToken() {
        VerificationTokenService.Token token = service.generatePasswordResetToken();

        assertThat(token.value()).isNotBlank();
        assertThat(token.expiresAt()).isAfter(Instant.now());
    }

    @Test
    void shouldValidateFutureToken() {
        VerificationTokenService.Token token = new VerificationTokenService.Token("valid", Instant.now().plusSeconds(60));

        assertThat(service.isValid(token)).isTrue();
    }

    @Test
    void shouldInvalidateExpiredToken() {
        VerificationTokenService.Token token = new VerificationTokenService.Token("expired", Instant.now().minusSeconds(1));

        assertThat(service.isValid(token)).isFalse();
    }

    @Test
    void shouldInvalidateNullOrBlankToken() {
        assertThat(service.isValid(new VerificationTokenService.Token(null, Instant.now().plusSeconds(60)))).isFalse();
        assertThat(service.isValid(new VerificationTokenService.Token("", Instant.now().plusSeconds(60)))).isFalse();
        assertThat(service.isValid(new VerificationTokenService.Token("value", null))).isFalse();
        assertThat(service.isValid(null)).isFalse();
    }
}
