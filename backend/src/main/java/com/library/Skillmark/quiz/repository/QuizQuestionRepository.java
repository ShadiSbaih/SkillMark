package com.library.Skillmark.quiz.repository;

import com.library.Skillmark.quiz.controller.*;
import com.library.Skillmark.quiz.dto.*;
import com.library.Skillmark.quiz.entity.*;
import com.library.Skillmark.quiz.enums.*;
import com.library.Skillmark.quiz.repository.*;
import com.library.Skillmark.quiz.service.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, UUID> {
    List<QuizQuestion> findByQuizIdOrderByPositionAsc(UUID quizId);
    long countByQuizId(UUID quizId);
    boolean existsByQuizIdAndPosition(UUID quizId, Integer position);
}
