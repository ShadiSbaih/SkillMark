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

public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    List<Quiz> findByProgramIdAndStatusNot(UUID programId, QuizStatus status);
    long countByProgramIdAndStatusNot(UUID programId, QuizStatus status);
    long countByProgramOrganizationIdAndStatusNot(UUID organizationId, QuizStatus status);
    List<Quiz> findByProgramIdAndDeletedAtIsNull(UUID programId);
    List<Quiz> findByProgramIdAndStatusAndDeletedAtIsNull(UUID programId, QuizStatus status);
    long countByProgramIdAndDeletedAtIsNull(UUID programId);
    long countByProgramOrganizationIdAndDeletedAtIsNull(UUID organizationId);
}
