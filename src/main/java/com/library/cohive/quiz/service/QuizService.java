package com.library.cohive.quiz.service;

import com.library.cohive.common.exception.ConflictException;
import com.library.cohive.common.exception.ForbiddenException;
import com.library.cohive.common.exception.ResourceNotFoundException;
import com.library.cohive.common.util.SecurityUtil;
import com.library.cohive.course.entity.Course;
import com.library.cohive.course.repository.CourseRepository;
import com.library.cohive.enrollment.repository.EnrollmentRepository;
import com.library.cohive.quiz.dto.CreateQuizRequest;
import com.library.cohive.quiz.dto.QuizAttemptResponse;
import com.library.cohive.quiz.dto.QuizResponse;
import com.library.cohive.quiz.dto.SubmitQuizAttemptRequest;
import com.library.cohive.quiz.entity.Quiz;
import com.library.cohive.quiz.entity.QuizAttempt;
import com.library.cohive.quiz.entity.QuizAttemptAnswer;
import com.library.cohive.quiz.entity.QuizOption;
import com.library.cohive.quiz.entity.QuizQuestion;
import com.library.cohive.quiz.repository.QuizAttemptAnswerRepository;
import com.library.cohive.quiz.repository.QuizAttemptRepository;
import com.library.cohive.quiz.repository.QuizOptionRepository;
import com.library.cohive.quiz.repository.QuizQuestionRepository;
import com.library.cohive.quiz.repository.QuizRepository;
import com.library.cohive.student.entity.Student;
import com.library.cohive.student.repository.StudentRepository;
import com.library.cohive.user.entity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuizService {
    private final QuizRepository quizRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizOptionRepository quizOptionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizAttemptAnswerRepository quizAttemptAnswerRepository;

    @Transactional
    public QuizResponse createQuiz(CreateQuizRequest request) {
        ensureOwnerRole();
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (!course.getOrganization().getOwner().getId().equals(SecurityUtil.getCurrentUserId())) {
            throw new ForbiddenException("Access denied");
        }

        Quiz quiz = Quiz.builder()
                .title(request.getTitle().trim())
                .passingScore(request.getPassingScore())
                .published(request.getPublished())
                .course(course)
                .build();
        Quiz savedQuiz = quizRepository.save(quiz);

        if (request.getQuestions() != null) {
            for (CreateQuizRequest.CreateQuizQuestionRequest questionRequest : request.getQuestions()) {
                validateQuestion(questionRequest);
                QuizQuestion question = QuizQuestion.builder()
                        .questionText(questionRequest.getQuestionText().trim())
                        .points(questionRequest.getPoints())
                        .displayOrder(questionRequest.getDisplayOrder())
                        .quiz(savedQuiz)
                        .build();
                QuizQuestion savedQuestion = quizQuestionRepository.save(question);
                savedQuiz.getQuestions().add(savedQuestion);

                for (CreateQuizRequest.CreateQuizOptionRequest optionRequest : questionRequest.getOptions()) {
                    QuizOption option = QuizOption.builder()
                            .optionText(optionRequest.getOptionText().trim())
                            .correct(optionRequest.getCorrect())
                            .displayOrder(optionRequest.getDisplayOrder())
                            .question(savedQuestion)
                            .build();
                    QuizOption savedOption = quizOptionRepository.save(option);
                    savedQuestion.getOptions().add(savedOption);
                }
            }
        }

        return QuizResponse.fromEntity(savedQuiz);
    }

    public List<QuizResponse> getCourseQuizzes(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        Role role = SecurityUtil.getCurrentUserRole();
        if (role == Role.OWNER) {
            if (!course.getOrganization().getOwner().getId().equals(SecurityUtil.getCurrentUserId())) {
                throw new ForbiddenException("Access denied");
            }
        } else {
            Student student = studentRepository.findByUser_Id(SecurityUtil.getCurrentUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
            boolean enrolled = enrollmentRepository.existsByCourse_IdAndStudent_Id(courseId, student.getId());
            if (!enrolled) {
                throw new ForbiddenException("Access denied");
            }
        }

        return quizRepository.findByCourse_Id(courseId).stream()
            .filter(quiz -> role == Role.OWNER || Boolean.TRUE.equals(quiz.getPublished()))
            .map(QuizResponse::fromEntity)
                .toList();
    }

    @Transactional
    public QuizAttemptResponse submitAttempt(UUID quizId, SubmitQuizAttemptRequest request) {
        if (SecurityUtil.getCurrentUserRole() != Role.STUDENT) {
            throw new ForbiddenException("Only students can submit quiz attempts");
        }

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        if (!Boolean.TRUE.equals(quiz.getPublished())) {
            throw new ForbiddenException("Quiz is not published");
        }

        Student student = studentRepository.findByUser_Id(SecurityUtil.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        boolean enrolled = enrollmentRepository.existsByCourse_IdAndStudent_Id(quiz.getCourse().getId(), student.getId());
        if (!enrolled) {
            throw new ForbiddenException("Access denied");
        }

        List<QuizQuestion> questions = quizQuestionRepository.findByQuiz_IdOrderByDisplayOrderAsc(quizId);
        if (questions.isEmpty()) {
            throw new ConflictException("Quiz has no questions");
        }

        Map<UUID, SubmitQuizAttemptRequest.AnswerRequest> answersByQuestion = request.getAnswers().stream()
                .collect(Collectors.toMap(
                        SubmitQuizAttemptRequest.AnswerRequest::getQuestionId,
                        Function.identity(),
                        (first, second) -> first));
        if (answersByQuestion.size() != questions.size()) {
            throw new ConflictException("All quiz questions must be answered");
        }

        int maxScore = questions.stream().mapToInt(QuizQuestion::getPoints).sum();
        int score = 0;
        QuizAttempt attempt = QuizAttempt.builder()
                .quiz(quiz)
                .student(student)
                .score(0)
                .maxScore(maxScore)
                .percentage(BigDecimal.ZERO)
                .passed(false)
                .submittedAt(Instant.now())
                .build();
        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);

        for (QuizQuestion question : questions) {
            SubmitQuizAttemptRequest.AnswerRequest answerRequest = answersByQuestion.get(question.getId());
            if (answerRequest == null) {
                throw new ConflictException("All quiz questions must be answered");
            }

            QuizOption selectedOption = quizOptionRepository
                    .findByIdAndQuestion_Id(answerRequest.getSelectedOptionId(), question.getId())
                    .orElseThrow(() -> new ConflictException("Selected option does not belong to the question"));
            boolean correct = Boolean.TRUE.equals(selectedOption.getCorrect());
            int pointsAwarded = correct ? question.getPoints() : 0;
            score += pointsAwarded;

            QuizAttemptAnswer answer = QuizAttemptAnswer.builder()
                    .attempt(savedAttempt)
                    .question(question)
                    .selectedOption(selectedOption)
                    .correct(correct)
                    .pointsAwarded(pointsAwarded)
                    .build();
            QuizAttemptAnswer savedAnswer = quizAttemptAnswerRepository.save(answer);
            savedAttempt.getAnswers().add(savedAnswer);
        }

        BigDecimal percentage = maxScore == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(score)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(maxScore), 2, RoundingMode.HALF_UP);
        savedAttempt.setScore(score);
        savedAttempt.setPercentage(percentage);
        savedAttempt.setPassed(percentage.compareTo(BigDecimal.valueOf(quiz.getPassingScore())) >= 0);
        QuizAttempt savedResult = quizAttemptRepository.save(savedAttempt);
        return QuizAttemptResponse.fromEntity(savedResult);
    }

    private void ensureOwnerRole() {
        if (SecurityUtil.getCurrentUserRole() != Role.OWNER) {
            throw new ForbiddenException("Only organization owners can manage quizzes");
        }
    }

    private void validateQuestion(CreateQuizRequest.CreateQuizQuestionRequest questionRequest) {
        long correctOptions = questionRequest.getOptions().stream()
                .filter(option -> Boolean.TRUE.equals(option.getCorrect()))
                .count();
        if (correctOptions != 1) {
            throw new ConflictException("Each question must have exactly one correct option");
        }
    }
}
