package com.library.Skillmark.email.service;

public interface EmailService {
    void sendVerificationEmail(String to, String name, String token);

    void sendPasswordResetEmail(String to, String name, String token);

    void sendInvitationEmail(String to, String programName, String inviteLink);
}
