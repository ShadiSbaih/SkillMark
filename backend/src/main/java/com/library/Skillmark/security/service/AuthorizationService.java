package com.library.Skillmark.security.service;

import com.library.Skillmark.attempt.entity.QuizAttempt;
import com.library.Skillmark.attempt.repository.QuizAttemptRepository;
import com.library.Skillmark.certificate.entity.Certificate;
import com.library.Skillmark.certificate.repository.CertificateRepository;
import com.library.Skillmark.common.exception.ForbiddenException;
import com.library.Skillmark.common.exception.NotFoundException;
import com.library.Skillmark.enrollment.enums.EnrollmentStatus;
import com.library.Skillmark.enrollment.repository.ProgramEnrollmentRepository;
import com.library.Skillmark.program.entity.Program;
import com.library.Skillmark.program.enums.ProgramStatus;
import com.library.Skillmark.program.repository.ProgramRepository;
import com.library.Skillmark.quiz.entity.Quiz;
import com.library.Skillmark.quiz.repository.QuizRepository;
import com.library.Skillmark.quiz.enums.QuizStatus;
import com.library.Skillmark.user.enums.UserRole;
import com.library.Skillmark.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthorizationService {
    private final ProgramRepository programRepository;
    private final ProgramEnrollmentRepository enrollmentRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository attemptRepository;
    private final CertificateRepository certificateRepository;
    private final UserRepository userRepository;

    public AuthorizationService(ProgramRepository programRepository,
                                ProgramEnrollmentRepository enrollmentRepository,
                                QuizRepository quizRepository,
                                QuizAttemptRepository attemptRepository,
                                CertificateRepository certificateRepository,
                                UserRepository userRepository) {
        this.programRepository = programRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.quizRepository = quizRepository;
        this.attemptRepository = attemptRepository;
        this.certificateRepository = certificateRepository;
        this.userRepository = userRepository;
    }

    public boolean isAdmin(UUID userId) {
        if (userId == null) return false;
        return userRepository.findById(userId)
                .map(u -> u.getRole() == UserRole.ADMIN)
                .orElse(false);
    }

    public void ensureAdmin(UUID userId) {
        if (!isAdmin(userId)) {
            throw new ForbiddenException("Admin permission is required");
        }
    }

    public Program ensureProgramOwner(UUID programId, UUID userId) {
        Program program = programRepository.findById(programId)
                .orElseThrow(() -> new NotFoundException("Program not found"));
        ensureProgramNotDeleted(program);
        if (isAdmin(userId)) {
            return program;
        }
        throw new ForbiddenException("Admin permission is required to manage programs");
    }

    public Program ensureProgramAccessible(UUID programId, UUID userId) {
        Program program = programRepository.findById(programId)
                .orElseThrow(() -> new NotFoundException("Program not found"));
        ensureProgramNotDeleted(program);
        if (isAdmin(userId)) {
            return program;
        }
        if (!enrollmentRepository.existsByProgramIdAndUserIdAndStatus(programId, userId, EnrollmentStatus.ACTIVE)) {
            if (program.getStatus() != ProgramStatus.PUBLISHED) {
                throw new NotFoundException("Program not found");
            }
        }
        return program;
    }

    public void ensureProgramEnrollment(UUID programId, UUID userId) {
        Program program = programRepository.findById(programId)
                .orElseThrow(() -> new NotFoundException("Program not found"));
        ensureProgramNotDeleted(program);
        if (isAdmin(userId)) {
            return;
        }
        if (!enrollmentRepository.existsByProgramIdAndUserIdAndStatus(programId, userId, EnrollmentStatus.ACTIVE)) {
            throw new ForbiddenException("Active program enrollment is required");
        }
    }

    public Quiz ensureQuizOwner(UUID quizId, UUID userId) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> new NotFoundException("Quiz not found"));
        ensureQuizNotDeleted(quiz);
        if (isAdmin(userId)) {
            return quiz;
        }
        throw new ForbiddenException("Admin permission is required to manage quizzes");
    }

    public Quiz ensureQuizAccessible(UUID quizId, UUID userId) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> new NotFoundException("Quiz not found"));
        ensureQuizNotDeleted(quiz);
        if (isAdmin(userId)) {
            return quiz;
        }
        if (!enrollmentRepository.existsByProgramIdAndUserIdAndStatus(quiz.getProgram().getId(), userId, EnrollmentStatus.ACTIVE)) {
            throw new NotFoundException("Quiz not found");
        }
        if (quiz.getStatus() != QuizStatus.PUBLISHED || !quiz.isVisibleToParticipants()) {
            throw new ForbiddenException("Quiz is not available");
        }
        return quiz;
    }

    public QuizAttempt ensureAttemptOwner(UUID attemptId, UUID userId) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new NotFoundException("Attempt not found"));
        if (!attempt.getUser().getId().equals(userId) && !isAdmin(userId)) {
            throw new ForbiddenException("Attempt owner permission is required");
        }
        return attempt;
    }

    public QuizAttempt ensureAttemptAccessible(UUID attemptId, UUID userId) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new NotFoundException("Attempt not found"));
        if (attempt.getUser().getId().equals(userId) || isAdmin(userId)) {
            return attempt;
        }
        throw new ForbiddenException("Attempt accessible permission is required");
    }

    public Certificate ensureCertificateAccessible(UUID certificateId, UUID userId) {
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new NotFoundException("Certificate not found"));
        if (certificate.getUser().getId().equals(userId) || isAdmin(userId)) {
            return certificate;
        }
        throw new ForbiddenException("Certificate accessible permission is required");
    }

    private void ensureProgramNotDeleted(Program program) {
        if (program.getDeletedAt() != null) {
            throw new NotFoundException("Program not found");
        }
    }

    private void ensureQuizNotDeleted(Quiz quiz) {
        ensureProgramNotDeleted(quiz.getProgram());
        if (quiz.getDeletedAt() != null) {
            throw new NotFoundException("Quiz not found");
        }
    }
}
