package com.library.Skillmark.auth.service;

import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;
import org.springframework.mock.env.MockEnvironment;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private final Environment testEnv = createEnv("test");

    private static Environment createEnv(String profile) {
        MockEnvironment env = new MockEnvironment();
        env.addActiveProfile(profile);
        return env;
    }

    @Test
    void shouldGenerateAndParseToken() {
        JwtService jwtService = new JwtService(base64Secret(), 86400000, testEnv);
        UUID userId = UUID.randomUUID();

        String token = jwtService.generateToken(userId, "test@example.com");

        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUserId(token)).isEqualTo(userId);
        assertThat(jwtService.extractEmail(token)).isEqualTo("test@example.com");
        assertThat(jwtService.isValid(token)).isTrue();
    }

    @Test
    void shouldRejectInvalidToken() {
        JwtService jwtService = new JwtService(base64Secret(), 86400000, testEnv);

        assertThat(jwtService.isValid("not.a.token")).isFalse();
    }

    @Test
    void shouldRejectTamperedToken() {
        JwtService jwtService = new JwtService(base64Secret(), 86400000, testEnv);
        String token = jwtService.generateToken(UUID.randomUUID(), "test@example.com") + "x";

        assertThat(jwtService.isValid(token)).isFalse();
    }

    @Test
    void shouldThrowWhenSecretMissingInProduction() {
        Environment prodEnv = createEnv("prod");

        assertThatThrownBy(() -> new JwtService("", 86400000, prodEnv))
                .isInstanceOf(IllegalArgumentException.class);
    }

    private String base64Secret() {
        return "SRzg2FX+wiw82zSXR1sCh+8O0kfCgOuuldMdJwMZabvaPehN/IFT99TTxmajaMq5uDFjddyj90DyQ9S5eTyKpg==";
    }
}
