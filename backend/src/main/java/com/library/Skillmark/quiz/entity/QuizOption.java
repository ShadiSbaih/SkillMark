package com.library.Skillmark.quiz.entity;

import com.library.Skillmark.quiz.controller.*;
import com.library.Skillmark.quiz.dto.*;
import com.library.Skillmark.quiz.entity.*;
import com.library.Skillmark.quiz.enums.*;
import com.library.Skillmark.quiz.repository.*;
import com.library.Skillmark.quiz.service.*;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "quiz_options",
        uniqueConstraints = @UniqueConstraint(name = "uq_option_position_per_question", columnNames = {"question_id", "position"}))
public class QuizOption {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private QuizQuestion question;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(name = "is_correct", nullable = false)
    private boolean correct;

    @Column(nullable = false)
    private Integer position;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

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
    public QuizQuestion getQuestion() { return question; }
    public void setQuestion(QuizQuestion question) { this.question = question; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public boolean isCorrect() { return correct; }
    public void setCorrect(boolean correct) { this.correct = correct; }
    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }
}
