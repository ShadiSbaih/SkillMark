package com.library.Skillmark.enrollment.entity;

import com.library.Skillmark.enrollment.enums.EnrollmentStatus;
import com.library.Skillmark.program.entity.Program;
import com.library.Skillmark.user.entity.User;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "program_enrollments")
public class ProgramEnrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

    @Column(name = "enrolled_at", nullable = false)
    private Instant enrolledAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "removed_at")
    private Instant removedAt;

    @PrePersist
    void prePersist() {
        enrolledAt = Instant.now();
    }

    public UUID getId() { return id; }
    public Program getProgram() { return program; }
    public void setProgram(Program program) { this.program = program; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public EnrollmentStatus getStatus() { return status; }
    public void setStatus(EnrollmentStatus status) { this.status = status; }
    public Instant getEnrolledAt() { return enrolledAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public Instant getRemovedAt() { return removedAt; }
    public void setRemovedAt(Instant removedAt) { this.removedAt = removedAt; }
}
