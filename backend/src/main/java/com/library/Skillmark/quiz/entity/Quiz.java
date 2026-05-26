package com.library.Skillmark.quiz.entity;

import java.time.Instant;
import java.util.UUID;

import com.library.Skillmark.program.entity.Program;
import com.library.Skillmark.quiz.enums.CertificateIssueMode;
import com.library.Skillmark.quiz.enums.QuizStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "quizzes")
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "passing_score", nullable = false)
    private Integer passingScore;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "max_attempts", nullable = false)
    private Integer maxAttempts = 1;

    @Column(name = "certificate_enabled", nullable = false)
    private boolean certificateEnabled;

    @Enumerated(EnumType.STRING)
    @Column(name = "certificate_issue_mode", nullable = false, length = 30)
    private CertificateIssueMode certificateIssueMode = CertificateIssueMode.NONE;

    @Column(name = "is_published", nullable = false)
    private boolean published;

    @Column(name = "visible_to_participants", nullable = false)
    private boolean visibleToParticipants = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private QuizStatus status = QuizStatus.DRAFT;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public Program getProgram() { return program; }
    public void setProgram(Program program) { this.program = program; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getPassingScore() { return passingScore; }
    public void setPassingScore(Integer passingScore) { this.passingScore = passingScore; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public Integer getMaxAttempts() { return maxAttempts; }
    public void setMaxAttempts(Integer maxAttempts) { this.maxAttempts = maxAttempts; }
    public boolean isCertificateEnabled() { return certificateEnabled; }
    public void setCertificateEnabled(boolean certificateEnabled) { this.certificateEnabled = certificateEnabled; }
    public CertificateIssueMode getCertificateIssueMode() { return certificateIssueMode; }
    public void setCertificateIssueMode(CertificateIssueMode certificateIssueMode) { this.certificateIssueMode = certificateIssueMode; }
    public boolean isPublished() { return status == QuizStatus.PUBLISHED; }
    public void setPublished(boolean published) {
        setStatus(published ? QuizStatus.PUBLISHED : QuizStatus.DRAFT);
    }
    public QuizStatus getStatus() { return status; }
    public void setStatus(QuizStatus status) {
        this.status = status;
        this.published = status == QuizStatus.PUBLISHED;
    }
    public boolean isVisibleToParticipants() { return visibleToParticipants; }
    public void setVisibleToParticipants(boolean visibleToParticipants) { this.visibleToParticipants = visibleToParticipants; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public Instant getDeletedAt() { return deletedAt; }
    public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }
}
