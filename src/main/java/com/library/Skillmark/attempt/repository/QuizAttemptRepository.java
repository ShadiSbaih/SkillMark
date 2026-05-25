package com.library.Skillmark.attempt.repository;

import com.library.Skillmark.attempt.controller.*;
import com.library.Skillmark.attempt.dto.*;
import com.library.Skillmark.attempt.entity.*;
import com.library.Skillmark.attempt.enums.*;
import com.library.Skillmark.attempt.repository.*;
import com.library.Skillmark.attempt.service.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {
    long countByQuizIdAndUserIdAndStatus(UUID quizId, UUID userId, AttemptStatus status);
    boolean existsByQuizIdAndUserIdAndStatus(UUID quizId, UUID userId, AttemptStatus status);
    boolean existsByQuizId(UUID quizId);
    long countByQuizId(UUID quizId);
    List<QuizAttempt> findByUserId(UUID userId);
    List<QuizAttempt> findByQuizId(UUID quizId);
    long countByQuizProgramId(UUID programId);
    long countByQuizProgramOrganizationId(UUID organizationId);
    long countByQuizIdAndStatus(UUID quizId, AttemptStatus status);
    long countByQuizIdAndPassed(UUID quizId, Boolean passed);
    long countByQuizProgramIdAndPassed(UUID programId, Boolean passed);
    long countByQuizProgramOrganizationIdAndPassed(UUID organizationId, Boolean passed);

    @Query("select avg(a.scorePercentage) from QuizAttempt a where a.quiz.id = :quizId and a.status = 'SUBMITTED'")
    Double averageScoreForQuiz(UUID quizId);

    @Query("select max(a.scorePercentage) from QuizAttempt a where a.quiz.id = :quizId and a.status = 'SUBMITTED'")
    java.math.BigDecimal highestScoreForQuiz(UUID quizId);

    @Query("select min(a.scorePercentage) from QuizAttempt a where a.quiz.id = :quizId and a.status = 'SUBMITTED'")
    java.math.BigDecimal lowestScoreForQuiz(UUID quizId);

    @Query("select avg(a.scorePercentage) from QuizAttempt a where a.quiz.program.id = :programId and a.status = 'SUBMITTED'")
    Double averageScoreForProgram(UUID programId);

    @Query("select avg(a.scorePercentage) from QuizAttempt a where a.quiz.program.organization.id = :organizationId and a.status = 'SUBMITTED'")
    Double averageScoreForOrganization(UUID organizationId);
}
