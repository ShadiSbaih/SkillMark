package com.library.Skillmark.email.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@Profile("!local & !test")
public class SendGridEmailService implements EmailService {
    private static final Logger logger = LoggerFactory.getLogger(SendGridEmailService.class);

    private final SendGrid sendGrid;
    private final String fromEmail;
    private final String baseUrl;

    public SendGridEmailService(@Value("${sendgrid.api-key:}") String apiKey,
                                @Value("${app.email.from:noreply@skillmark.app}") String fromEmail,
                                @Value("${app.base-url:}") String baseUrl) {
        this.sendGrid = new SendGrid(apiKey);
        this.fromEmail = fromEmail;
        this.baseUrl = baseUrl == null || baseUrl.isBlank() ? "" : baseUrl.replaceAll("/$", "");
    }

    @Override
    public void sendVerificationEmail(String to, String name, String token) {
        String subject = "Verify your Skillmark email";
        String link = baseUrl + "/verify-email?token=" + token;
        String body = buildBody("Hi " + name + ",",
                "Please verify your Skillmark email address by clicking the link below:",
                link,
                "This link will expire in 24 hours. If you did not create an account, you can safely ignore this email.");
        send(to, subject, body);
    }

    @Override
    public void sendPasswordResetEmail(String to, String name, String token) {
        String subject = "Reset your Skillmark password";
        String link = baseUrl + "/reset-password?token=" + token;
        String body = buildBody("Hi " + name + ",",
                "You requested a password reset. Click the link below to choose a new password:",
                link,
                "This link will expire in 1 hour. If you did not request this, you can safely ignore this email.");
        send(to, subject, body);
    }

    @Override
    public void sendInvitationEmail(String to, String programName, String inviteLink) {
        String subject = "You're invited to a Skillmark program";
        String body = buildBody("Hi,",
                "You've been invited to join the program \"" + programName + "\" on Skillmark.",
                inviteLink,
                "Click the link above to view the program and join. If you weren't expecting this invitation, you can safely ignore this email.");
        send(to, subject, body);
    }

    private String buildBody(String greeting, String actionText, String link, String footer) {
        return greeting + "\n\n"
                + actionText + "\n\n"
                + link + "\n\n"
                + footer + "\n\n"
                + "- The Skillmark Team";
    }

    private void send(String to, String subject, String body) {
        Email from = new Email(fromEmail);
        Email recipient = new Email(to);
        Content content = new Content("text/plain", body);
        Mail mail = new Mail(from, subject, recipient, content);

        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sendGrid.api(request);
            if (response.getStatusCode() < 200 || response.getStatusCode() >= 300) {
                logger.warn("SendGrid returned status {} for recipient {}", response.getStatusCode(), to);
            }
        } catch (IOException ex) {
            logger.error("Failed to send email to {}", to, ex);
        }
    }
}
