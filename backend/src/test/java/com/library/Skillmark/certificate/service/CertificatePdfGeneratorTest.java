package com.library.Skillmark.certificate.service;

import com.library.Skillmark.attempt.entity.QuizAttempt;
import com.library.Skillmark.certificate.entity.Certificate;
import com.library.Skillmark.certificate.enums.CertificateStatus;
import com.library.Skillmark.certificate.repository.CertificateRepository;
import com.library.Skillmark.program.entity.Program;
import com.library.Skillmark.quiz.entity.Quiz;
import com.library.Skillmark.storage.service.StorageService;
import com.library.Skillmark.user.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CertificatePdfGeneratorTest {

    @Mock
    private CertificateRepository certificateRepository;

    @Mock
    private StorageService storageService;

    @InjectMocks
    private CertificatePdfGenerator generator;

    @Test
    void generateAndUpload_usesQrAndPdfKeysAndSetsUrls() throws Exception {
        UUID certificateId = UUID.randomUUID();
        Certificate certificate = new Certificate();
        setField(certificate, "id", certificateId);
        certificate.setCertificateNumber("CERT-0001");
        certificate.setVerificationCode("ABC123XYZ");
        certificate.setTitle("Certificate");
        certificate.setParticipantNameSnapshot("Jane Doe");
        certificate.setQuizTitleSnapshot("Final Quiz");
        certificate.setProgramTitleSnapshot("Intro Program");
        certificate.setOwnerNameSnapshot("Owner Name");
        certificate.setStatus(CertificateStatus.ACTIVE);
        setField(certificate, "issuedAt", Instant.parse("2026-07-15T10:00:00Z"));
        certificate.setProgram(new Program());
        certificate.setQuiz(new Quiz());
        certificate.setUser(new User());
        QuizAttempt attempt = new QuizAttempt();
        setField(attempt, "id", UUID.randomUUID());
        attempt.setScorePercentage(new BigDecimal("92.5"));
        certificate.setAttempt(attempt);

        when(certificateRepository.findById(certificateId)).thenReturn(Optional.of(certificate));
        when(storageService.uploadBytes(anyString(), any(byte[].class), anyString()))
                .thenAnswer(invocation -> "https://example.com/" + invocation.getArgument(0));

        generator.generateAndUpload(certificateId);

        verify(storageService).uploadBytes(
                eq("certificates/" + certificateId + "/qr.png"),
                any(byte[].class),
                eq("image/png")
        );
        verify(storageService).uploadBytes(
                eq("certificates/" + certificateId + "/certificate.pdf"),
                any(byte[].class),
                eq("application/pdf")
        );

        assertNotNull(certificate.getPdfUrl());
        assertTrue(certificate.getPdfUrl().contains("/certificate.pdf"));
        assertNotNull(certificate.getQrCodeUrl());
        assertTrue(certificate.getQrCodeUrl().contains("/qr.png"));
        assertEquals("certificates/" + certificateId + "/certificate.pdf", certificate.getPdfObjectKey());
        assertEquals("certificates/" + certificateId + "/qr.png", certificate.getQrCodeObjectKey());
    }

    @Test
    void generateAndUpload_throwsWhenCertificateNotFound() {
        UUID certificateId = UUID.randomUUID();
        when(certificateRepository.findById(certificateId)).thenReturn(Optional.empty());

        assertThrows(com.library.Skillmark.common.exception.NotFoundException.class,
                () -> generator.generateAndUpload(certificateId));
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}
