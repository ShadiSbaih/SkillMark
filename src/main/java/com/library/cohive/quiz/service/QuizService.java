package com.library.cohive.quiz.service;

import com.library.cohive.common.exception.ForbiddenException;
import com.library.cohive.common.exception.ResourceNotFoundException;
import com.library.cohive.common.util.SecurityUtil;
import com.library.cohive.course.entity.Course;
import com.library.cohive.course.repository.CourseRepository;
import com.library.cohive.enrollment.repository.EnrollmentRepository;
import com.library.cohive.quiz.dto.CreateQuizRequest;
import com.library.cohive.quiz.dto.QuizResponse;
import com.library.cohive.quiz.entity.Quiz;
import com.library.cohive.quiz.repository.QuizRepository;
import com.library.cohive.student.entity.Student;
import com.library.cohive.student.repository.StudentRepository;
import com.library.cohive.user.entity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuizService {
    private final QuizRepository quizRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;

    public QuizResponse createQuiz(CreateQuizRequest request) {
        ensureOwnerRole();
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (!course.getOrganization().getOwner().getId().equals(SecurityUtil.getCurrentUserId())) {
            throw new ForbiddenException("Access denied");
        }

        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .course(course)
                .build();
        return QuizResponse.fromEntity(quizRepository.save(quiz));
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
            .map(QuizResponse::fromEntity)
                .toList();
    }

    private void ensureOwnerRole() {
        if (SecurityUtil.getCurrentUserRole() != Role.OWNER) {
            throw new ForbiddenException("Only organization owners can manage quizzes");
        }
    }
}
