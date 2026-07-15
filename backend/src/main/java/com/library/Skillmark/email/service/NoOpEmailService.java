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

    @Override
    public void sendInvitationEmail(String to, String programName, String inviteLink) {
        logger.info("[NoOpEmail] Invitation email to {} for program '{}': link={}", to, programName, inviteLink);
    }

    @Override
    public void sendCertificateIssuedEmail(String to, String name, String programName, String certificateUrl) {
        logger.info("[NoOpEmail] Certificate issued email to {} for program '{}': link={}", to, programName, certificateUrl);
    }

    @Override
    public void sendEnrollmentConfirmationEmail(String to, String name, String programName, String programUrl) {
        logger.info("[NoOpEmail] Enrollment confirmation email to {} for program '{}': link={}", to, programName, programUrl);
    }
}
