package com.library.Skillmark.attempt.repository;

import com.library.Skillmark.attempt.controller.*;
import com.library.Skillmark.attempt.dto.*;
import com.library.Skillmark.attempt.entity.*;
import com.library.Skillmark.attempt.enums.*;
import com.library.Skillmark.attempt.repository.*;
import com.library.Skillmark.attempt.service.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {
    long countByQuizIdAndUserIdAndStatus(UUID quizId, UUID userId, AttemptStatus status);
    long countByQuizIdAndUserId(UUID quizId, UUID userId);
    boolean existsByQuizIdAndUserIdAndStatus(UUID quizId, UUID userId, AttemptStatus status);
    Optional<QuizAttempt> findByQuizIdAndUserIdAndStatus(UUID quizId, UUID userId, AttemptStatus status);
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

    @Query("""
            select floor(a.scorePercentage / 10) * 10, count(a.id)
            from QuizAttempt a
            where a.quiz.id = :quizId and a.status = 'SUBMITTED'
            group by floor(a.scorePercentage / 10) * 10
            order by floor(a.scorePercentage / 10) * 10
            """)
    List<Object[]> scoreDistributionForQuiz(UUID quizId);

    @Query("""
            select function('date_trunc', 'day', a.startedAt),
                   count(a.id),
                   sum(case when a.status = 'SUBMITTED' then 1 else 0 end),
                   sum(case when a.passed = true then 1 else 0 end)
            from QuizAttempt a
            where a.quiz.id = :quizId and a.startedAt between :start and :end
            group by function('date_trunc', 'day', a.startedAt)
            order by function('date_trunc', 'day', a.startedAt)
            """)
    List<Object[]> dailyTimelineForQuiz(UUID quizId, Instant start, Instant end);

    @Query("""
            select function('date_trunc', 'week', a.startedAt),
                   count(a.id),
                   sum(case when a.status = 'SUBMITTED' then 1 else 0 end),
                   sum(case when a.passed = true then 1 else 0 end)
            from QuizAttempt a
            where a.quiz.id = :quizId and a.startedAt between :start and :end
            group by function('date_trunc', 'week', a.startedAt)
            order by function('date_trunc', 'week', a.startedAt)
            """)
    List<Object[]> weeklyTimelineForQuiz(UUID quizId, Instant start, Instant end);

    @Query("""
            select q.id, q.text, q.position, count(a.id),
                   sum(case when a.correct = true then 1 else 0 end),
                   sum(case when a.correct = false then 1 else 0 end)
            from QuizAttemptAnswer a
            join a.question q
            where q.quiz.id = :quizId
            group by q.id, q.text, q.position
            order by q.position
            """)
    List<Object[]> questionAnswerStatsForQuiz(UUID quizId);

    @Query("""
            select o.id, o.text, o.position, o.correct, count(a.id)
            from QuizAttemptAnswer a
            join a.selectedOption o
            where a.question.id = :questionId
            group by o.id, o.text, o.position, o.correct
            order by o.position
            """)
    List<Object[]> optionSelectionStatsForQuestion(UUID questionId);

    @Query("select count(a.id) from QuizAttempt a where a.quiz.program.id = :programId and a.status = 'SUBMITTED'")
    long submittedAttemptsCountForProgram(UUID programId);

    @Query("select count(distinct a.user.id) from QuizAttempt a where a.quiz.program.id = :programId and a.status = 'SUBMITTED'")
    long distinctParticipantsWithAttemptsForProgram(UUID programId);

    @Query("select count(distinct a.user.id) from QuizAttempt a where a.quiz.program.id = :programId and a.status = 'SUBMITTED' and a.passed = true")
    long distinctParticipantsPassedForProgram(UUID programId);
}
