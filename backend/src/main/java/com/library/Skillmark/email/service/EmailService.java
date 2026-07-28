package com.library.Skillmark.email.service;

public interface EmailService {


    void sendCertificateIssuedEmail(String to, String name, String programName, String certificateUrl);

    void sendEnrollmentConfirmationEmail(String to, String name, String programName, String programUrl);
}
