package com.library.Skillmark.quiz.service;

import com.library.Skillmark.audit.enums.AuditAction;
import com.library.Skillmark.audit.service.AuditLogService;
import com.library.Skillmark.attempt.repository.QuizAttemptRepository;
import com.library.Skillmark.common.exception.BadRequestException;
import com.library.Skillmark.common.exception.BusinessRuleException;
import com.library.Skillmark.common.exception.NotFoundException;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.enrollment.enums.EnrollmentStatus;
import com.library.Skillmark.enrollment.repository.ProgramEnrollmentRepository;
import com.library.Skillmark.program.entity.Program;
import com.library.Skillmark.program.repository.ProgramRepository;
import com.library.Skillmark.quiz.dto.*;
import com.library.Skillmark.quiz.entity.*;
import com.library.Skillmark.quiz.enums.*;
import com.library.Skillmark.quiz.repository.*;
import com.library.Skillmark.security.service.AuthorizationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class QuizService {
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizOptionRepository optionRepository;
    private final QuizAttemptRepository attemptRepository;
    private final ProgramRepository programRepository;
    private final ProgramEnrollmentRepository enrollmentRepository;
    private final AuthorizationService authorizationService;
    private final AuditLogService auditLogService;

    public QuizService(QuizRepository quizRepository,
                       QuizQuestionRepository questionRepository,
                       QuizOptionRepository optionRepository,
                       QuizAttemptRepository attemptRepository,
                       ProgramRepository programRepository,
                       ProgramEnrollmentRepository enrollmentRepository,
                       AuthorizationService authorizationService,
                       AuditLogService auditLogService) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.attemptRepository = attemptRepository;
        this.programRepository = programRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.authorizationService = authorizationService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public QuizResponse create(UUID programId, CreateQuizRequest request, UUID actorId) {
        Program program = authorizationService.ensureProgramOwner(programId, actorId);
        Quiz quiz = new Quiz();
        quiz.setProgram(program);
        quiz.setTitle(request.title().trim());
        quiz.setDescription(request.description());
        quiz.setPassingScore(request.passingScore());
        quiz.setDurationMinutes(request.durationMinutes());
        quiz.setMaxAttempts(request.maxAttempts());
        quiz.setCertificateIssueMode(request.certificateIssueMode() == null ? CertificateIssueMode.NONE : request.certificateIssueMode());
        Quiz saved = quizRepository.save(quiz);
        auditLogService.record(actorId, null, AuditAction.QUIZ_CREATED, "Quiz", saved.getId());
        return toResponse(saved, true);
    }

    @Transactional(readOnly = true)
    public PageResponse<QuizResponse> listAccessible(UUID actorId, int page, int size) {
        boolean admin = authorizationService.isAdmin(actorId);
        List<Quiz> quizzes;
        if (admin) {
            quizzes = quizRepository.findByDeletedAtIsNull();
        } else {
            quizzes = enrollmentRepository.findByUserIdAndStatus(actorId, EnrollmentStatus.ACTIVE).stream()
                    .flatMap(enrollment -> quizRepository.findByProgramIdAndStatusAndVisibleToParticipantsTrueAndDeletedAtIsNull(
                            enrollment.getProgram().getId(), QuizStatus.PUBLISHED).stream())
                    .distinct()
                    .toList();
        }
        return PageResponse.fromList(quizzes.stream()
                .sorted(Comparator.comparing(Quiz::getCreatedAt).reversed())
                .map(quiz -> toResponse(quiz, admin))
                .toList(), page, size);
    }

    @Transactional(readOnly = true)
    public PageResponse<QuizResponse> listByProgram(UUID programId, UUID actorId, int page, int size) {
        authorizationService.ensureProgramAccessible(programId, actorId);
        boolean admin = authorizationService.isAdmin(actorId);
        List<Quiz> quizzes = admin
                ? quizRepository.findByProgramIdAndDeletedAtIsNull(programId)
                : quizRepository.findByProgramIdAndStatusAndVisibleToParticipantsTrueAndDeletedAtIsNull(programId, QuizStatus.PUBLISHED);
        return PageResponse.fromList(quizzes.stream()
                .sorted(Comparator.comparing(Quiz::getCreatedAt).reversed())
                .map(quiz -> toResponse(quiz, admin))
                .toList(), page, size);
    }

    @Transactional(readOnly = true)
    public QuizResponse get(UUID quizId, UUID actorId) {
        Quiz quiz = authorizationService.ensureQuizAccessible(quizId, actorId);
        boolean admin = authorizationService.isAdmin(actorId);
        return toResponse(quiz, admin);
    }

    @Transactional
    public QuizResponse update(UUID quizId, UpdateQuizRequest request, UUID actorId) {
        Quiz quiz = authorizationService.ensureQuizOwner(quizId, actorId);
        if (attemptRepository.existsByQuizId(quizId) && protectedSettingsChanged(quiz, request)) {
            throw new BusinessRuleException("Only title and description can be changed after attempts exist");
        }
        quiz.setTitle(request.title().trim());
        quiz.setDescription(request.description());
        quiz.setPassingScore(request.passingScore());
        quiz.setDurationMinutes(request.durationMinutes());
        quiz.setMaxAttempts(request.maxAttempts());
        quiz.setCertificateIssueMode(request.certificateIssueMode() == null ? CertificateIssueMode.NONE : request.certificateIssueMode());
        auditLogService.record(actorId, null, AuditAction.QUIZ_UPDATED, "Quiz", quizId);
        return toResponse(quiz, true);
    }

    @Transactional
    public QuizResponse updateVisibility(UUID quizId, boolean visibleToParticipants, UUID actorId) {
        Quiz quiz = authorizationService.ensureQuizOwner(quizId, actorId);
        quiz.setVisibleToParticipants(visibleToParticipants);
        auditLogService.record(actorId, null, AuditAction.QUIZ_UPDATED, "Quiz", quizId);
        return toResponse(quiz, true);
    }

    @Transactional
    public QuizResponse archive(UUID quizId, UUID actorId) {
        Quiz quiz = authorizationService.ensureQuizOwner(quizId, actorId);
        quiz.setStatus(QuizStatus.ARCHIVED);
        auditLogService.record(actorId, null, AuditAction.QUIZ_ARCHIVED, "Quiz", quizId);
        return toResponse(quiz, true);
    }

    @Transactional
    public QuizResponse updateStatus(UUID quizId, QuizStatus status, UUID actorId) {
        if (status == QuizStatus.PUBLISHED) {
            return publish(quizId, actorId);
        }
        if (status == QuizStatus.ARCHIVED) {
            return archive(quizId, actorId);
        }
        throw new BusinessRuleException("Quiz status can only be changed to PUBLISHED or ARCHIVED");
    }

    @Transactional
    public void delete(UUID quizId, UUID actorId) {
        Quiz quiz = authorizationService.ensureQuizOwner(quizId, actorId);
        quiz.setStatus(QuizStatus.ARCHIVED);
        quiz.setDeletedAt(Instant.now());
        auditLogService.record(actorId, null, AuditAction.QUIZ_ARCHIVED, "Quiz", quizId);
    }

    @Transactional
    public QuestionResponse addQuestion(UUID quizId, CreateQuestionRequest request, UUID actorId) {
        Quiz quiz = authorizationService.ensureQuizOwner(quizId, actorId);
        ensureQuizStructureMutable(quiz);
        if (request.type() != QuestionType.SINGLE_CHOICE) {
            throw new BadRequestException("MVP supports SINGLE_CHOICE questions only");
        }
        validateOptions(request.options());
        if (questionRepository.existsByQuizIdAndPosition(quizId, request.position())) {
            throw new BadRequestException("Question position already exists for this quiz");
        }
        QuizQuestion question = new QuizQuestion();
        question.setQuiz(quiz);
        question.setText(request.text().trim());
        question.setType(request.type());
        question.setPoints(request.points());
        question.setPosition(request.position());
        QuizQuestion saved = questionRepository.save(question);
        request.options().forEach(optionRequest -> {
            QuizOption option = new QuizOption();
            option.setQuestion(saved);
            option.setText(optionRequest.text().trim());
            option.setCorrect(optionRequest.isCorrect());
            option.setPosition(optionRequest.position());
            optionRepository.save(option);
        });
        return toQuestionResponse(saved, true);
    }

    @Transactional
    public QuestionResponse updateQuestion(UUID quizId, UUID questionId, CreateQuestionRequest request, UUID actorId) {
        Quiz quiz = authorizationService.ensureQuizOwner(quizId, actorId);
        QuizQuestion question = requireQuestionInQuiz(quizId, questionId);
        ensureQuizStructureMutable(quiz);
        if (request.type() != QuestionType.SINGLE_CHOICE) {
            throw new BadRequestException("MVP supports SINGLE_CHOICE questions only");
        }
        validateOptions(request.options());
        boolean duplicatePosition = questionRepository.findByQuizIdOrderByPositionAsc(quiz.getId()).stream()
                .anyMatch(existing -> existing.getPosition().equals(request.position()) && !existing.getId().equals(questionId));
        if (duplicatePosition) {
            throw new BadRequestException("Question position already exists for this quiz");
        }
        question.setText(request.text().trim());
        question.setType(request.type());
        question.setPoints(request.points());
        question.setPosition(request.position());
        optionRepository.findByQuestionIdOrderByPositionAsc(questionId).forEach(optionRepository::delete);
        optionRepository.flush();
        request.options().forEach(optionRequest -> {
            QuizOption option = new QuizOption();
            option.setQuestion(question);
            option.setText(optionRequest.text().trim());
            option.setCorrect(optionRequest.isCorrect());
            option.setPosition(optionRequest.position());
            optionRepository.save(option);
        });
        auditLogService.record(actorId, null, AuditAction.QUIZ_UPDATED, "QuizQuestion", questionId);
        return toQuestionResponse(question, true);
    }

    @Transactional
    public void deleteQuestion(UUID quizId, UUID questionId, UUID actorId) {
        Quiz quiz = authorizationService.ensureQuizOwner(quizId, actorId);
        QuizQuestion question = requireQuestionInQuiz(quizId, questionId);
        ensureQuizStructureMutable(quiz);
        optionRepository.findByQuestionIdOrderByPositionAsc(questionId).forEach(optionRepository::delete);
        questionRepository.delete(question);
        auditLogService.record(actorId, null, AuditAction.QUIZ_UPDATED, "QuizQuestion", questionId);
    }

    @Transactional
    public OptionResponse addOption(UUID quizId, UUID questionId, CreateOptionRequest request, UUID actorId) {
        Quiz quiz = authorizationService.ensureQuizOwner(quizId, actorId);
        QuizQuestion question = requireQuestionInQuiz(quizId, questionId);
        ensureQuizStructureMutable(quiz);
        boolean duplicatePosition = optionRepository.findByQuestionIdOrderByPositionAsc(questionId).stream()
                .anyMatch(existing -> existing.getPosition().equals(request.position()));
        if (duplicatePosition) {
            throw new BadRequestException("Option position already exists for this question");
        }
        QuizOption option = new QuizOption();
        option.setQuestion(question);
        option.setText(request.text().trim());
        option.setCorrect(request.isCorrect());
        option.setPosition(request.position());
        QuizOption saved = optionRepository.save(option);
        auditLogService.record(actorId, null, AuditAction.QUIZ_UPDATED, "QuizOption", saved.getId());
        return OptionResponse.from(saved, true);
    }

    @Transactional
    public OptionResponse updateOption(UUID quizId, UUID questionId, UUID optionId, CreateOptionRequest request, UUID actorId) {
        QuizOption option = requireOptionInQuestion(quizId, questionId, optionId);
        Quiz quiz = authorizationService.ensureQuizOwner(quizId, actorId);
        ensureQuizStructureMutable(quiz);
        boolean duplicatePosition = optionRepository.findByQuestionIdOrderByPositionAsc(questionId).stream()
                .anyMatch(existing -> existing.getPosition().equals(request.position()) && !existing.getId().equals(optionId));
        if (duplicatePosition) {
            throw new BadRequestException("Option position already exists for this question");
        }
        option.setText(request.text().trim());
        option.setCorrect(request.isCorrect());
        option.setPosition(request.position());
        auditLogService.record(actorId, null, AuditAction.QUIZ_UPDATED, "QuizOption", optionId);
        return OptionResponse.from(option, true);
    }

    @Transactional
    public void deleteOption(UUID quizId, UUID questionId, UUID optionId, UUID actorId) {
        QuizOption option = requireOptionInQuestion(quizId, questionId, optionId);
        Quiz quiz = authorizationService.ensureQuizOwner(quizId, actorId);
        ensureQuizStructureMutable(quiz);
        optionRepository.delete(option);
        auditLogService.record(actorId, null, AuditAction.QUIZ_UPDATED, "QuizOption", optionId);
    }

    @Transactional
    public QuizResponse publish(UUID quizId, UUID actorId) {
        Quiz quiz = authorizationService.ensureQuizOwner(quizId, actorId);
        validatePublishable(quiz);
        quiz.setStatus(QuizStatus.PUBLISHED);
        auditLogService.record(actorId, null, AuditAction.QUIZ_PUBLISHED, "Quiz", quizId);
        return toResponse(quiz, true);
    }

    private QuizQuestion requireQuestionInQuiz(UUID quizId, UUID questionId) {
        QuizQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new NotFoundException("Question not found"));
        if (!question.getQuiz().getId().equals(quizId)) {
            throw new NotFoundException("Question not found for this quiz");
        }
        return question;
    }

    private QuizOption requireOptionInQuestion(UUID quizId, UUID questionId, UUID optionId) {
        QuizOption option = optionRepository.findById(optionId)
                .orElseThrow(() -> new NotFoundException("Option not found"));
        if (!option.getQuestion().getId().equals(questionId)) {
            throw new NotFoundException("Option not found for this question");
        }
        if (!option.getQuestion().getQuiz().getId().equals(quizId)) {
            throw new NotFoundException("Option not found for this quiz");
        }
        return option;
    }

    private void validatePublishable(Quiz quiz) {
        if (quiz.getStatus() == QuizStatus.ARCHIVED || quiz.getDeletedAt() != null) {
            throw new BusinessRuleException("Archived or deleted quizzes cannot be published");
        }
        if (quiz.getPassingScore() < 0 || quiz.getPassingScore() > 100) {
            throw new BusinessRuleException("Passing score must be between 0 and 100");
        }
        if (questionRepository.countByQuizId(quiz.getId()) == 0) {
            throw new BusinessRuleException("Quiz must have at least one question before publishing");
        }
        questionRepository.findByQuizIdOrderByPositionAsc(quiz.getId()).forEach(question -> {
            List<QuizOption> options = optionRepository.findByQuestionIdOrderByPositionAsc(question.getId());
            if (options.size() < 2) {
                throw new BusinessRuleException("Each question must have at least two options");
            }
            long correct = options.stream().filter(QuizOption::isCorrect).count();
            if (question.getType() == QuestionType.SINGLE_CHOICE && correct != 1) {
                throw new BusinessRuleException("Each SINGLE_CHOICE question must have exactly one correct option");
            }
        });
    }

    private void ensureQuizStructureMutable(Quiz quiz) {
        if (quiz.getStatus() == QuizStatus.ARCHIVED || quiz.getDeletedAt() != null) {
            throw new BusinessRuleException("Archived or deleted quizzes cannot be changed");
        }
        if (attemptRepository.countByQuizIdAndStatus(quiz.getId(), com.library.Skillmark.attempt.enums.AttemptStatus.SUBMITTED) > 0) {
            throw new BusinessRuleException("Questions and options cannot be changed after submitted attempts exist");
        }
    }

    private void validateOptions(List<CreateOptionRequest> options) {
        if (options.size() < 2) {
            throw new BadRequestException("A question must have at least two options");
        }
        long correct = options.stream().filter(CreateOptionRequest::isCorrect).count();
        if (correct != 1) {
            throw new BadRequestException("SINGLE_CHOICE questions must have exactly one correct option");
        }
        long uniquePositions = options.stream().map(CreateOptionRequest::position).distinct().count();
        if (uniquePositions != options.size()) {
            throw new BadRequestException("Option positions must be unique");
        }
    }

    private boolean protectedSettingsChanged(Quiz quiz, UpdateQuizRequest request) {
        return !Objects.equals(quiz.getPassingScore(), request.passingScore())
                || !Objects.equals(quiz.getDurationMinutes(), request.durationMinutes())
                || !Objects.equals(quiz.getMaxAttempts(), request.maxAttempts())
                || quiz.getCertificateIssueMode() != (request.certificateIssueMode() == null ? CertificateIssueMode.NONE : request.certificateIssueMode());
    }

    private QuizResponse toResponse(Quiz quiz, boolean includeCorrectAnswers) {
        List<QuestionResponse> questions = questionRepository.findByQuizIdOrderByPositionAsc(quiz.getId()).stream()
                .map(question -> toQuestionResponse(question, includeCorrectAnswers))
                .toList();
        return new QuizResponse(quiz.getId(), quiz.getProgram().getId(), quiz.getTitle(), quiz.getDescription(),
            quiz.getPassingScore(), quiz.getDurationMinutes(), quiz.getMaxAttempts(), quiz.getCertificateIssueMode(),
            quiz.isVisibleToParticipants(), quiz.isPublished(), quiz.getStatus(), quiz.getCreatedAt(), questions);
    }

    private QuestionResponse toQuestionResponse(QuizQuestion question, boolean includeCorrectAnswers) {
        List<OptionResponse> options = optionRepository.findByQuestionIdOrderByPositionAsc(question.getId()).stream()
                .map(option -> OptionResponse.from(option, includeCorrectAnswers))
                .toList();
        return new QuestionResponse(question.getId(), question.getText(), question.getType(), question.getPoints(),
                question.getPosition(), options);
    }
}
