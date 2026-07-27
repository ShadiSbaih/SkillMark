package com.library.Skillmark.email.service;

public interface EmailService {
    void sendVerificationEmail(String to, String name, String token);

    void sendPasswordResetEmail(String to, String name, String token);

    void sendCertificateIssuedEmail(String to, String name, String programName, String certificateUrl);

    void sendEnrollmentConfirmationEmail(String to, String name, String programName, String programUrl);
}
