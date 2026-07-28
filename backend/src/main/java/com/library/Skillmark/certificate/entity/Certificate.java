package com.library.Skillmark.certificate.entity;

import com.library.Skillmark.attempt.entity.QuizAttempt;
import com.library.Skillmark.certificate.enums.CertificateStatus;
import com.library.Skillmark.program.entity.Program;
import com.library.Skillmark.quiz.entity.Quiz;
import com.library.Skillmark.user.entity.User;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "certificates")
public class Certificate {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "certificate_number", nullable = false, unique = true, length = 100)
    private String certificateNumber;

    @Column(name = "verification_code", nullable = false, unique = true, length = 150)
    private String verificationCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id", nullable = false)
    private QuizAttempt attempt;

    @Column(nullable = false)
    private String title;

    @Column(name = "participant_name_snapshot", nullable = false, length = 150)
    private String participantNameSnapshot;

    @Column(name = "quiz_title_snapshot", nullable = false)
    private String quizTitleSnapshot;

    @Column(name = "program_title_snapshot", nullable = false)
    private String programTitleSnapshot;

    @Column(name = "owner_name_snapshot", length = 150)
    private String ownerNameSnapshot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CertificateStatus status = CertificateStatus.ACTIVE;

    @Column(name = "issued_at", nullable = false)
    private Instant issuedAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "revoke_reason", columnDefinition = "TEXT")
    private String revokeReason;

    @Column(name = "pdf_url", columnDefinition = "TEXT")
    private String pdfUrl;

    @Column(name = "pdf_object_key", columnDefinition = "TEXT")
    private String pdfObjectKey;

    @Column(name = "qr_code_url", columnDefinition = "TEXT")
    private String qrCodeUrl;

    @Column(name = "qr_code_object_key", columnDefinition = "TEXT")
    private String qrCodeObjectKey;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (issuedAt == null) {
            issuedAt = now;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getCertificateNumber() { return certificateNumber; }
    public void setCertificateNumber(String certificateNumber) { this.certificateNumber = certificateNumber; }
    public String getVerificationCode() { return verificationCode; }
    public void setVerificationCode(String verificationCode) { this.verificationCode = verificationCode; }
    public Program getProgram() { return program; }
    public void setProgram(Program program) { this.program = program; }
    public Quiz getQuiz() { return quiz; }
    public void setQuiz(Quiz quiz) { this.quiz = quiz; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public QuizAttempt getAttempt() { return attempt; }
    public void setAttempt(QuizAttempt attempt) { this.attempt = attempt; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getParticipantNameSnapshot() { return participantNameSnapshot; }
    public void setParticipantNameSnapshot(String participantNameSnapshot) { this.participantNameSnapshot = participantNameSnapshot; }
    public String getQuizTitleSnapshot() { return quizTitleSnapshot; }
    public void setQuizTitleSnapshot(String quizTitleSnapshot) { this.quizTitleSnapshot = quizTitleSnapshot; }
    public String getProgramTitleSnapshot() { return programTitleSnapshot; }
    public void setProgramTitleSnapshot(String programTitleSnapshot) { this.programTitleSnapshot = programTitleSnapshot; }
    public String getOwnerNameSnapshot() { return ownerNameSnapshot; }
    public void setOwnerNameSnapshot(String ownerNameSnapshot) { this.ownerNameSnapshot = ownerNameSnapshot; }
    public CertificateStatus getStatus() { return status; }
    public void setStatus(CertificateStatus status) { this.status = status; }
    public Instant getIssuedAt() { return issuedAt; }
    public Instant getRevokedAt() { return revokedAt; }
    public void setRevokedAt(Instant revokedAt) { this.revokedAt = revokedAt; }
    public String getRevokeReason() { return revokeReason; }
    public void setRevokeReason(String revokeReason) { this.revokeReason = revokeReason; }
    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }
    public String getPdfObjectKey() { return pdfObjectKey; }
    public void setPdfObjectKey(String pdfObjectKey) { this.pdfObjectKey = pdfObjectKey; }
    public String getQrCodeUrl() { return qrCodeUrl; }
    public void setQrCodeUrl(String qrCodeUrl) { this.qrCodeUrl = qrCodeUrl; }
    public String getQrCodeObjectKey() { return qrCodeObjectKey; }
    public void setQrCodeObjectKey(String qrCodeObjectKey) { this.qrCodeObjectKey = qrCodeObjectKey; }
}
