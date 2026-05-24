package com.library.cohive.quiz.repository;

import com.library.cohive.quiz.entity.QuizOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface QuizOptionRepository extends JpaRepository<QuizOption, UUID> {
    Optional<QuizOption> findByIdAndQuestion_Id(UUID optionId, UUID questionId);
}
