package com.library.Skillmark.quiz.repository;

import com.library.Skillmark.quiz.entity.Quiz;
import com.library.Skillmark.quiz.enums.QuizStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    List<Quiz> findByProgramIdAndStatusNot(UUID programId, QuizStatus status);
    long countByProgramIdAndStatusNot(UUID programId, QuizStatus status);
    List<Quiz> findByProgramIdAndDeletedAtIsNull(UUID programId);
    List<Quiz> findByProgramIdAndStatusAndDeletedAtIsNull(UUID programId, QuizStatus status);
    List<Quiz> findByProgramIdAndStatusAndVisibleToParticipantsTrueAndDeletedAtIsNull(UUID programId, QuizStatus status);
    List<Quiz> findByDeletedAtIsNull();
    long countByProgramIdAndDeletedAtIsNull(UUID programId);
    long countByDeletedAtIsNull();

    default long countByProgramOrganizationIdAndDeletedAtIsNull(UUID organizationId) {
        return countByDeletedAtIsNull();
    }
}
