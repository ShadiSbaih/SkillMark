package com.library.Skillmark.attempt.repository;

import com.library.Skillmark.attempt.controller.*;
import com.library.Skillmark.attempt.dto.*;
import com.library.Skillmark.attempt.entity.*;
import com.library.Skillmark.attempt.enums.*;
import com.library.Skillmark.attempt.repository.*;
import com.library.Skillmark.attempt.service.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface QuizAttemptAnswerRepository extends JpaRepository<QuizAttemptAnswer, UUID> {
}
