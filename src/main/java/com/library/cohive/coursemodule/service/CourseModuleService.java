package com.library.cohive.coursemodule.service;

import com.library.cohive.common.exception.ForbiddenException;
import com.library.cohive.common.exception.ResourceNotFoundException;
import com.library.cohive.common.util.SecurityUtil;
import com.library.cohive.course.entity.Course;
import com.library.cohive.course.repository.CourseRepository;
import com.library.cohive.coursemodule.dto.CourseModuleResponse;
import com.library.cohive.coursemodule.dto.CreateCourseModuleRequest;
import com.library.cohive.coursemodule.dto.CreateLessonRequest;
import com.library.cohive.coursemodule.dto.LessonResponse;
import com.library.cohive.coursemodule.entity.CourseModule;
import com.library.cohive.coursemodule.entity.Lesson;
import com.library.cohive.coursemodule.repository.CourseModuleRepository;
import com.library.cohive.coursemodule.repository.LessonRepository;
import com.library.cohive.enrollment.repository.EnrollmentRepository;
import com.library.cohive.student.entity.Student;
import com.library.cohive.student.repository.StudentRepository;
import com.library.cohive.user.entity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseModuleService {
    private final CourseModuleRepository courseModuleRepository;
    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;

    @Transactional
    public CourseModuleResponse createModule(UUID courseId, CreateCourseModuleRequest request) {
        ensureOwnerRole();
        Course course = courseRepository.findByIdAndOrganization_Owner_Id(courseId, SecurityUtil.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        CourseModule module = CourseModule.builder()
                .title(request.getTitle().trim())
                .displayOrder(request.getDisplayOrder())
                .course(course)
                .build();
        return CourseModuleResponse.fromEntity(courseModuleRepository.save(module));
    }

    @Transactional
    public LessonResponse createLesson(UUID moduleId, CreateLessonRequest request) {
        ensureOwnerRole();
        CourseModule module = courseModuleRepository.findByIdAndCourse_Organization_Owner_Id(
                        moduleId, SecurityUtil.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));

        Lesson lesson = Lesson.builder()
                .title(request.getTitle().trim())
                .content(request.getContent().trim())
                .resourceUrl(StringUtils.hasText(request.getResourceUrl()) ? request.getResourceUrl().trim() : null)
                .displayOrder(request.getDisplayOrder())
                .module(module)
                .build();
        return LessonResponse.fromEntity(lessonRepository.save(lesson));
    }

    @Transactional(readOnly = true)
    public List<CourseModuleResponse> getCourseModules(UUID courseId) {
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

        return courseModuleRepository.findByCourse_IdOrderByDisplayOrderAsc(courseId).stream()
                .map(CourseModuleResponse::fromEntity)
                .toList();
    }

    private void ensureOwnerRole() {
        if (SecurityUtil.getCurrentUserRole() != Role.OWNER) {
            throw new ForbiddenException("Only organization owners can manage course modules");
        }
    }
}
