package com.library.Skillmark.attempt.service;

import com.library.Skillmark.attempt.controller.*;
import com.library.Skillmark.attempt.dto.*;
import com.library.Skillmark.attempt.entity.*;
import com.library.Skillmark.attempt.enums.*;
import com.library.Skillmark.attempt.repository.*;
import com.library.Skillmark.attempt.service.*;
import com.library.Skillmark.audit.enums.AuditAction;
import com.library.Skillmark.audit.service.AuditLogService;
import com.library.Skillmark.certificate.service.CertificateService;
import com.library.Skillmark.common.exception.BadRequestException;
import com.library.Skillmark.common.exception.BusinessRuleException;
import com.library.Skillmark.common.exception.ConflictException;
import com.library.Skillmark.common.exception.NotFoundException;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.quiz.controller.*;
import com.library.Skillmark.quiz.dto.*;
import com.library.Skillmark.quiz.entity.*;
import com.library.Skillmark.quiz.enums.*;
import com.library.Skillmark.quiz.repository.*;
import com.library.Skillmark.quiz.service.*;
import com.library.Skillmark.security.service.AuthorizationService;
import com.library.Skillmark.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class QuizAttemptService {
    private static final Logger LOGGER = LoggerFactory.getLogger(QuizAttemptService.class);
    private final QuizAttemptRepository attemptRepository;
    private final QuizAttemptAnswerRepository answerRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizOptionRepository optionRepository;
    private final UserRepository userRepository;
    private final AuthorizationService authorizationService;
    private final CertificateService certificateService;
    private final AuditLogService auditLogService;

    public QuizAttemptService(QuizAttemptRepository attemptRepository,
                              QuizAttemptAnswerRepository answerRepository,
                              QuizRepository quizRepository,
                              QuizQuestionRepository questionRepository,
                              QuizOptionRepository optionRepository,
                              UserRepository userRepository,
                              AuthorizationService authorizationService,
                              CertificateService certificateService,
                              AuditLogService auditLogService) {
        this.attemptRepository = attemptRepository;
        this.answerRepository = answerRepository;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.userRepository = userRepository;
        this.authorizationService = authorizationService;
        this.certificateService = certificateService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public StartAttemptResponse start(UUID quizId, UUID userId) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> new NotFoundException("Quiz not found"));
        if (!quiz.isPublished() || quiz.getStatus() != QuizStatus.PUBLISHED) {
            throw new BusinessRuleException("Quiz is not open for attempts");
        }
        authorizationService.ensureProgramEnrollment(quiz.getProgram().getId(), userId);
        if (attemptRepository.existsByQuizIdAndUserIdAndStatus(quizId, userId, AttemptStatus.IN_PROGRESS)) {
            throw new ConflictException("An in-progress attempt already exists for this quiz");
        }
        long priorAttempts = attemptRepository.countByQuizIdAndUserId(quizId, userId);
        if (priorAttempts >= quiz.getMaxAttempts()) {
            throw new BusinessRuleException("Maximum attempts reached");
        }
        Instant startedAt = Instant.now();
        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setUser(userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found")));
        attempt.setAttemptNumber((int) priorAttempts + 1);
        attempt.setStartedAt(startedAt);
        attempt.setExpiresAt(startedAt.plus(java.time.Duration.ofMinutes(quiz.getDurationMinutes())));
        return StartAttemptResponse.from(attemptRepository.save(attempt));
    }

    @Transactional(noRollbackFor = BusinessRuleException.class)
    public AttemptResultResponse submit(UUID attemptId, SubmitAttemptRequest request, UUID userId) {
        QuizAttempt attempt = authorizationService.ensureAttemptOwner(attemptId, userId);
        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new ConflictException("Attempt has already been submitted");
        }
        if (Instant.now().isAfter(attempt.getExpiresAt())) {
            attempt.setStatus(AttemptStatus.EXPIRED);
            throw new BusinessRuleException("Attempt time limit has expired");
        }
        Map<UUID, SubmitAnswerRequest> answerMap = new LinkedHashMap<>();
        for (SubmitAnswerRequest answer : request.answers()) {
            if (answerMap.put(answer.questionId(), answer) != null) {
                throw new BadRequestException("Duplicate answer for question " + answer.questionId());
            }
        }
        List<QuizQuestion> questions = questionRepository.findByQuizIdOrderByPositionAsc(attempt.getQuiz().getId());
        Map<UUID, QuizQuestion> questionMap = questions.stream().collect(Collectors.toMap(QuizQuestion::getId, Function.identity()));
        int totalPoints = questions.stream().mapToInt(QuizQuestion::getPoints).sum();
        int awarded = 0;

        for (SubmitAnswerRequest answerRequest : request.answers()) {
            QuizQuestion question = questionMap.get(answerRequest.questionId());
            if (question == null) {
                throw new BadRequestException("Question does not belong to this quiz");
            }
            QuizOption selected = optionRepository.findById(answerRequest.selectedOptionId())
                    .orElseThrow(() -> new BadRequestException("Selected option not found"));
            if (!selected.getQuestion().getId().equals(question.getId())) {
                throw new BadRequestException("Selected option does not belong to the submitted question");
            }
            boolean correct = selected.isCorrect();
            int points = correct ? question.getPoints() : 0;
            awarded += points;

            QuizAttemptAnswer answer = new QuizAttemptAnswer();
            answer.setAttempt(attempt);
            answer.setQuestion(question);
            answer.setSelectedOption(selected);
            answer.setCorrect(correct);
            answer.setPointsAwarded(points);
            answerRepository.save(answer);
        }

        BigDecimal percentage = totalPoints == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(awarded).multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalPoints), 2, RoundingMode.HALF_UP);
        boolean passed = percentage.compareTo(BigDecimal.valueOf(attempt.getQuiz().getPassingScore())) >= 0;
        attempt.setTotalPoints(totalPoints);
        attempt.setEarnedPoints(awarded);
        attempt.setScorePercentage(percentage);
        attempt.setPassed(passed);
        attempt.setStatus(AttemptStatus.SUBMITTED);
        attempt.setSubmittedAt(Instant.now());
        auditLogService.record(userId, attempt.getQuiz().getProgram().getOrganization().getId(), AuditAction.ATTEMPT_SUBMITTED, "QuizAttempt", attemptId);

        Optional<com.library.Skillmark.certificate.entity.Certificate> certificate = Optional.empty();
        try {
            certificate = certificateService.issueAutomaticallyIfEligible(attempt);
        } catch (RuntimeException ex) {
            LOGGER.error("AUTO certificate issuance failed for attempt {}", attempt.getId(), ex);
        }
        return new AttemptResultResponse(attempt.getId(), totalPoints, awarded, percentage, passed, attempt.getStatus(),
                attempt.getSubmittedAt(), certificate.isPresent(), certificate.map(com.library.Skillmark.certificate.entity.Certificate::getId).orElse(null));
    }

    @Transactional(readOnly = true)
    public PageResponse<AttemptResponse> mine(UUID userId, int page, int size) {
        return PageResponse.fromList(attemptRepository.findByUserId(userId).stream()
                .sorted(Comparator.comparing(QuizAttempt::getStartedAt).reversed())
                .map(AttemptResponse::from)
                .toList(), page, size);
    }

    @Transactional(readOnly = true)
    public AttemptResponse get(UUID attemptId, UUID userId) {
        return AttemptResponse.from(authorizationService.ensureAttemptAccessible(attemptId, userId));
    }

    @Transactional(readOnly = true)
    public PageResponse<AttemptResponse> listForQuiz(UUID quizId, UUID actorId, int page, int size) {
        Quiz quiz = authorizationService.ensureQuizOwner(quizId, actorId);
        return PageResponse.fromList(attemptRepository.findByQuizId(quiz.getId()).stream()
                .sorted(Comparator.comparing(QuizAttempt::getStartedAt).reversed())
                .map(AttemptResponse::from)
                .toList(), page, size);
    }
}
