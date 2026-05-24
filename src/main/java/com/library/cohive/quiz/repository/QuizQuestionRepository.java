package com.library.cohive.quiz.repository;

import com.library.cohive.quiz.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, UUID> {
    List<QuizQuestion> findByQuiz_IdOrderByDisplayOrderAsc(UUID quizId);
}
