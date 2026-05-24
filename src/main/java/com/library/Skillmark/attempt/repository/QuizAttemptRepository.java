package com.library.Skillmark.attempt.repository;

import com.library.Skillmark.attempt.controller.*;
import com.library.Skillmark.attempt.dto.*;
import com.library.Skillmark.attempt.entity.*;
import com.library.Skillmark.attempt.enums.*;
import com.library.Skillmark.attempt.repository.*;
import com.library.Skillmark.attempt.service.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {
    long countByQuizIdAndUserIdAndStatus(UUID quizId, UUID userId, AttemptStatus status);
    boolean existsByQuizIdAndUserIdAndStatus(UUID quizId, UUID userId, AttemptStatus status);
    boolean existsByQuizId(UUID quizId);
    List<QuizAttempt> findByUserId(UUID userId);
    List<QuizAttempt> findByQuizId(UUID quizId);
}
