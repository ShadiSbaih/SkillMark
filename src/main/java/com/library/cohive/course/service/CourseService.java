package com.library.cohive.course.service;

import com.library.cohive.common.exception.ForbiddenException;
import com.library.cohive.common.exception.ResourceNotFoundException;
import com.library.cohive.common.util.SecurityUtil;
import com.library.cohive.course.dto.CourseResponse;
import com.library.cohive.course.dto.CreateCourseRequest;
import com.library.cohive.course.dto.UpdateCourseRequest;
import com.library.cohive.course.entity.Course;
import com.library.cohive.course.repository.CourseRepository;
import com.library.cohive.enrollment.repository.EnrollmentRepository;
import com.library.cohive.organization.entity.Organization;
import com.library.cohive.organization.repository.OrganizationRepository;
import com.library.cohive.student.entity.Student;
import com.library.cohive.student.repository.StudentRepository;
import com.library.cohive.user.entity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseRepository courseRepository;
    private final OrganizationRepository organizationRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;

    public CourseResponse createCourse(CreateCourseRequest request) {
        ensureOwnerRole();

        Organization organization = getOwnedOrganization(request.getOrganizationId());
        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .organization(organization)
                .build();
        return CourseResponse.fromEntity(courseRepository.save(course));
    }

    public Page<CourseResponse> getCourses(Pageable pageable, UUID organizationId) {
        Role role = SecurityUtil.getCurrentUserRole();
        List<Course> courses;

        if (role == Role.OWNER) {
            if (organizationId != null) {
                Organization organization = getOwnedOrganization(organizationId);
                courses = courseRepository.findByOrganization_Id(organization.getId());
            } else {
                courses = courseRepository.findByOrganization_Owner_Id(SecurityUtil.getCurrentUserId());
            }
        } else {
            Student student = studentRepository.findByUser_Id(SecurityUtil.getCurrentUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
            courses = enrollmentRepository.findByStudent_Id(student.getId()).stream()
                    .map(enrollment -> enrollment.getCourse())
                    .filter(course -> organizationId == null || course.getOrganization().getId().equals(organizationId))
                    .toList();
        }

        List<CourseResponse> content = courses.stream()
            .map(CourseResponse::fromEntity)
            .toList();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), content.size());
        List<CourseResponse> pageItems = start >= content.size()
            ? List.of()
            : content.subList(start, end);
        return new PageImpl<>(pageItems, pageable, content.size());
    }

    public CourseResponse getCourse(UUID courseId) {
        Role role = SecurityUtil.getCurrentUserRole();

        if (role == Role.OWNER) {
            Course course = courseRepository.findByIdAndOrganization_Owner_Id(courseId, SecurityUtil.getCurrentUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
            return CourseResponse.fromEntity(course);
        }

        Student student = studentRepository.findByUser_Id(SecurityUtil.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        boolean enrolled = enrollmentRepository.existsByCourse_IdAndStudent_Id(courseId, student.getId());
        if (!enrolled) {
            throw new ForbiddenException("Access denied");
        }
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return CourseResponse.fromEntity(course);
    }

    public CourseResponse updateCourse(UUID courseId, UpdateCourseRequest request) {
        ensureOwnerRole();
        Course course = courseRepository.findByIdAndOrganization_Owner_Id(courseId, SecurityUtil.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        return CourseResponse.fromEntity(courseRepository.save(course));
    }

    public void deleteCourse(UUID courseId) {
        ensureOwnerRole();
        Course course = courseRepository.findByIdAndOrganization_Owner_Id(courseId, SecurityUtil.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        courseRepository.delete(course);
    }

    private void ensureOwnerRole() {
        if (SecurityUtil.getCurrentUserRole() != Role.OWNER) {
            throw new ForbiddenException("Only organization owners can manage courses");
        }
    }

    private Organization getOwnedOrganization(UUID organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        if (!organization.getOwner().getId().equals(SecurityUtil.getCurrentUserId())) {
            throw new ForbiddenException("Access denied");
        }
        return organization;
    }

}
