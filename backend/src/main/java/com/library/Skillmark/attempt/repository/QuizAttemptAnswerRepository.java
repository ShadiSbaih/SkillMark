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

public interface QuizAttemptAnswerRepository extends JpaRepository<QuizAttemptAnswer, UUID> {

    @Query("""
            SELECT a.question.id, a.question.text, a.question.position, a.question.points,
                   COUNT(a), SUM(CASE WHEN a.correct = true THEN 1 ELSE 0 END)
            FROM QuizAttemptAnswer a
            WHERE a.attempt.quiz.id = :quizId AND a.attempt.status = 'SUBMITTED'
            GROUP BY a.question.id, a.question.text, a.question.position, a.question.points
            ORDER BY a.question.position ASC
            """)
    List<Object[]> findQuestionStatsByQuizId(UUID quizId);
}
