package com.library.Skillmark.attempt.entity;

import com.library.Skillmark.attempt.controller.*;
import com.library.Skillmark.attempt.dto.*;
import com.library.Skillmark.attempt.entity.*;
import com.library.Skillmark.attempt.enums.*;
import com.library.Skillmark.attempt.repository.*;
import com.library.Skillmark.attempt.service.*;
import com.library.Skillmark.quiz.entity.QuizOption;
import com.library.Skillmark.quiz.entity.QuizQuestion;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "quiz_attempt_answers",
        uniqueConstraints = @UniqueConstraint(name = "uq_answer_per_question_per_attempt", columnNames = {"attempt_id", "question_id"}))
public class QuizAttemptAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id", nullable = false)
    private QuizAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private QuizQuestion question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_option_id")
    private QuizOption selectedOption;

    @Column(name = "is_correct", nullable = false)
    private boolean correct;

    @Column(name = "points_awarded", nullable = false)
    private Integer pointsAwarded = 0;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }

    public void setAttempt(QuizAttempt attempt) { this.attempt = attempt; }
    public void setQuestion(QuizQuestion question) { this.question = question; }
    public void setSelectedOption(QuizOption selectedOption) { this.selectedOption = selectedOption; }
    public void setCorrect(boolean correct) { this.correct = correct; }
    public void setPointsAwarded(Integer pointsAwarded) { this.pointsAwarded = pointsAwarded; }
    public void setPointsAwarded(java.math.BigDecimal pointsAwarded) {
        this.pointsAwarded = pointsAwarded == null ? null : pointsAwarded.setScale(0, java.math.RoundingMode.HALF_UP).intValue();
    }
}
