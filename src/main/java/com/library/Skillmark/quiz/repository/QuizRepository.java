package com.library.Skillmark.quiz.repository;

import com.library.Skillmark.quiz.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    List<Quiz> findByCourse_Id(UUID courseId);
}
