package com.library.Skillmark.auth.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMillis;

    public JwtService(@Value("${jwt.secret:}") String secret,
                      @Value("${jwt.expiration:86400000}") long expirationMillis,
                      Environment environment) {
        this.expirationMillis = expirationMillis;
        if (secret == null || secret.isBlank()) {
            if (isDevOrTest(environment)) {
                this.key = Jwts.SIG.HS512.key().build();
            } else {
                throw new IllegalArgumentException("jwt.secret must be configured");
            }
        } else {
            this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        }
    }

    private boolean isDevOrTest(Environment environment) {
        for (String profile : environment.getActiveProfiles()) {
            if ("local".equals(profile) || "test".equals(profile)) {
                return true;
            }
        }
        return false;
    }

    public String generateToken(UUID userId, String email) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMillis)))
                .signWith(key)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (ExpiredJwtException | UnsupportedJwtException | MalformedJwtException | SignatureException | IllegalArgumentException e) {
            return false;
        }
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parseToken(token).getSubject());
    }

    public String extractEmail(String token) {
        return parseToken(token).get("email", String.class);
    }
}
