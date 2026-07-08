package com.library.Skillmark.email.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("local | test")
public class NoOpEmailService implements EmailService {
    private static final Logger logger = LoggerFactory.getLogger(NoOpEmailService.class);

    @Override
    public void sendVerificationEmail(String to, String name, String token) {
        logger.info("[NoOpEmail] Verification email to {}: token={}", to, token);
    }

    @Override
    public void sendPasswordResetEmail(String to, String name, String token) {
        logger.info("[NoOpEmail] Password reset email to {}: token={}", to, token);
    }
}
