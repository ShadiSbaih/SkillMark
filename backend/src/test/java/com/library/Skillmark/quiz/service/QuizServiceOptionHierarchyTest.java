package com.library.Skillmark.quiz.service;

import com.library.Skillmark.audit.service.AuditLogService;
import com.library.Skillmark.attempt.enums.AttemptStatus;
import com.library.Skillmark.attempt.repository.QuizAttemptRepository;
import com.library.Skillmark.common.exception.NotFoundException;
import com.library.Skillmark.enrollment.repository.ProgramEnrollmentRepository;
import com.library.Skillmark.membership.repository.OrganizationMembershipRepository;
import com.library.Skillmark.organization.entity.Organization;
import com.library.Skillmark.program.entity.Program;
import com.library.Skillmark.program.repository.ProgramRepository;
import com.library.Skillmark.quiz.dto.CreateOptionRequest;
import com.library.Skillmark.quiz.dto.CreateQuestionRequest;
import com.library.Skillmark.quiz.dto.OptionResponse;
import com.library.Skillmark.quiz.dto.QuestionResponse;
import com.library.Skillmark.quiz.entity.Quiz;
import com.library.Skillmark.quiz.entity.QuizOption;
import com.library.Skillmark.quiz.entity.QuizQuestion;
import com.library.Skillmark.quiz.enums.QuestionType;
import com.library.Skillmark.quiz.repository.QuizOptionRepository;
import com.library.Skillmark.quiz.repository.QuizQuestionRepository;
import com.library.Skillmark.quiz.repository.QuizRepository;
import com.library.Skillmark.security.service.AuthorizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuizServiceOptionHierarchyTest {

    @Mock
    private QuizRepository quizRepository;
    @Mock
    private QuizQuestionRepository questionRepository;
    @Mock
    private QuizOptionRepository optionRepository;
    @Mock
    private QuizAttemptRepository attemptRepository;
    @Mock
    private ProgramRepository programRepository;
    @Mock
    private ProgramEnrollmentRepository enrollmentRepository;
    @Mock
    private OrganizationMembershipRepository membershipRepository;
    @Mock
    private AuthorizationService authorizationService;
    @Mock
    private AuditLogService auditLogService;

    private QuizService quizService;

    private final UUID actorId = UUID.randomUUID();
    private final UUID organizationId = UUID.randomUUID();
    private final UUID quizId = UUID.randomUUID();
    private final UUID questionId = UUID.randomUUID();
    private final UUID optionId = UUID.randomUUID();

    private Quiz quiz;
    private QuizQuestion question;
    private QuizOption option;

    @BeforeEach
    void setUp() {
        quizService = new QuizService(quizRepository, questionRepository, optionRepository, attemptRepository,
                programRepository, enrollmentRepository, membershipRepository, authorizationService, auditLogService);

        Organization organization = new Organization();
        setId(organization, organizationId);

        Program program = new Program();
        setId(program, UUID.randomUUID());
        program.setOrganization(organization);

        quiz = new Quiz();
        setId(quiz, quizId);
        quiz.setProgram(program);

        question = new QuizQuestion();
        setId(question, questionId);
        question.setQuiz(quiz);
        question.setType(QuestionType.SINGLE_CHOICE);
        question.setPosition(1);

        option = new QuizOption();
        setId(option, optionId);
        option.setQuestion(question);
        option.setText("Original");
        option.setCorrect(true);
        option.setPosition(1);

        lenient().when(authorizationService.ensureQuizOwner(quizId, actorId)).thenReturn(quiz);
        lenient().when(attemptRepository.countByQuizIdAndStatus(quizId, AttemptStatus.SUBMITTED)).thenReturn(0L);
    }

    @Test
    void addOptionSavesOptionWhenQuestionBelongsToQuiz() {
        CreateOptionRequest request = new CreateOptionRequest("New option", false, 2);
        QuizOption saved = new QuizOption();
        setId(saved, UUID.randomUUID());
        saved.setText(request.text());
        saved.setCorrect(request.isCorrect());
        saved.setPosition(request.position());
        saved.setQuestion(question);

        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
        when(optionRepository.findByQuestionIdOrderByPositionAsc(questionId)).thenReturn(List.of(option));
        when(optionRepository.save(any(QuizOption.class))).thenReturn(saved);

        OptionResponse response = quizService.addOption(quizId, questionId, request, actorId);

        assertThat(response.text()).isEqualTo("New option");
        assertThat(response.position()).isEqualTo(2);
        verify(auditLogService).record(eq(actorId), eq(organizationId), any(), eq("QuizOption"), eq(saved.getId()));
    }

    @Test
    void addOptionThrowsNotFoundWhenQuestionDoesNotBelongToQuiz() {
        Quiz otherQuiz = new Quiz();
        setId(otherQuiz, UUID.randomUUID());
        question.setQuiz(otherQuiz);

        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));

        CreateOptionRequest request = new CreateOptionRequest("New option", false, 2);
        assertThatThrownBy(() -> quizService.addOption(quizId, questionId, request, actorId))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Question not found for this quiz");
    }

    @Test
    void updateOptionUpdatesOptionWhenHierarchyMatches() {
        CreateOptionRequest request = new CreateOptionRequest("Updated text", false, 2);

        when(optionRepository.findById(optionId)).thenReturn(Optional.of(option));
        when(optionRepository.findByQuestionIdOrderByPositionAsc(questionId)).thenReturn(List.of(option));

        OptionResponse response = quizService.updateOption(quizId, questionId, optionId, request, actorId);

        assertThat(response.text()).isEqualTo("Updated text");
        assertThat(response.isCorrect()).isFalse();
        assertThat(response.position()).isEqualTo(2);
        verify(auditLogService).record(eq(actorId), eq(organizationId), any(), eq("QuizOption"), eq(optionId));
    }

    @Test
    void updateOptionThrowsNotFoundWhenOptionBelongsToAnotherQuestion() {
        QuizQuestion otherQuestion = new QuizQuestion();
        setId(otherQuestion, UUID.randomUUID());
        otherQuestion.setQuiz(quiz);
        option.setQuestion(otherQuestion);

        when(optionRepository.findById(optionId)).thenReturn(Optional.of(option));

        CreateOptionRequest request = new CreateOptionRequest("Updated text", false, 2);
        assertThatThrownBy(() -> quizService.updateOption(quizId, questionId, optionId, request, actorId))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Option not found for this question");
    }

    @Test
    void updateOptionThrowsNotFoundWhenQuestionBelongsToAnotherQuiz() {
        Quiz otherQuiz = new Quiz();
        setId(otherQuiz, UUID.randomUUID());
        question.setQuiz(otherQuiz);

        when(optionRepository.findById(optionId)).thenReturn(Optional.of(option));

        CreateOptionRequest request = new CreateOptionRequest("Updated text", false, 2);
        assertThatThrownBy(() -> quizService.updateOption(quizId, questionId, optionId, request, actorId))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Option not found for this quiz");
    }

    @Test
    void deleteOptionRemovesOptionWhenHierarchyMatches() {
        when(optionRepository.findById(optionId)).thenReturn(Optional.of(option));

        quizService.deleteOption(quizId, questionId, optionId, actorId);

        verify(optionRepository).delete(option);
        verify(auditLogService).record(eq(actorId), eq(organizationId), any(), eq("QuizOption"), eq(optionId));
    }

    @Test
    void deleteOptionThrowsNotFoundWhenHierarchyDoesNotMatch() {
        QuizQuestion otherQuestion = new QuizQuestion();
        setId(otherQuestion, UUID.randomUUID());
        otherQuestion.setQuiz(quiz);
        option.setQuestion(otherQuestion);

        when(optionRepository.findById(optionId)).thenReturn(Optional.of(option));

        assertThatThrownBy(() -> quizService.deleteOption(quizId, questionId, optionId, actorId))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Option not found for this question");
    }

    @Test
    void updateQuestionUpdatesQuestionWhenHierarchyMatches() {
        CreateQuestionRequest request = new CreateQuestionRequest(
                "Updated question", QuestionType.SINGLE_CHOICE, 2, 2,
                List.of(new CreateOptionRequest("A", true, 1), new CreateOptionRequest("B", false, 2)));

        QuizOption optA = new QuizOption();
        setId(optA, UUID.randomUUID());
        optA.setQuestion(question);
        optA.setText("A");
        optA.setCorrect(true);
        optA.setPosition(1);

        QuizOption optB = new QuizOption();
        setId(optB, UUID.randomUUID());
        optB.setQuestion(question);
        optB.setText("B");
        optB.setCorrect(false);
        optB.setPosition(2);

        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
        when(questionRepository.findByQuizIdOrderByPositionAsc(quizId)).thenReturn(List.of(question));
        when(optionRepository.findByQuestionIdOrderByPositionAsc(questionId)).thenReturn(List.of(optA, optB));
        when(optionRepository.save(any(QuizOption.class))).thenAnswer(invocation -> {
            QuizOption saved = invocation.getArgument(0);
            return saved.getText().equals("A") ? optA : optB;
        });

        QuestionResponse response = quizService.updateQuestion(quizId, questionId, request, actorId);

        assertThat(response.text()).isEqualTo("Updated question");
        assertThat(response.points()).isEqualTo(2);
        assertThat(response.position()).isEqualTo(2);
        verify(auditLogService).record(eq(actorId), eq(organizationId), any(), eq("QuizQuestion"), eq(questionId));
    }

    @Test
    void updateQuestionThrowsNotFoundWhenQuestionDoesNotBelongToQuiz() {
        Quiz otherQuiz = new Quiz();
        setId(otherQuiz, UUID.randomUUID());
        question.setQuiz(otherQuiz);

        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));

        CreateQuestionRequest request = new CreateQuestionRequest(
                "Updated question", QuestionType.SINGLE_CHOICE, 1, 1,
                List.of(new CreateOptionRequest("A", true, 1), new CreateOptionRequest("B", false, 2)));

        assertThatThrownBy(() -> quizService.updateQuestion(quizId, questionId, request, actorId))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Question not found for this quiz");
    }

    @Test
    void deleteQuestionRemovesQuestionWhenHierarchyMatches() {
        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
        when(optionRepository.findByQuestionIdOrderByPositionAsc(questionId)).thenReturn(List.of(option));

        quizService.deleteQuestion(quizId, questionId, actorId);

        verify(optionRepository).findByQuestionIdOrderByPositionAsc(questionId);
        verify(questionRepository).delete(question);
        verify(auditLogService).record(eq(actorId), eq(organizationId), any(), eq("QuizQuestion"), eq(questionId));
    }

    @Test
    void deleteQuestionThrowsNotFoundWhenQuestionDoesNotBelongToQuiz() {
        Quiz otherQuiz = new Quiz();
        setId(otherQuiz, UUID.randomUUID());
        question.setQuiz(otherQuiz);

        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));

        assertThatThrownBy(() -> quizService.deleteQuestion(quizId, questionId, actorId))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Question not found for this quiz");
    }

    private void setId(Object target, UUID id) {
        try {
            Field field = target.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(target, id);
        } catch (NoSuchFieldException | IllegalAccessException ex) {
            throw new RuntimeException(ex);
        }
    }
}
