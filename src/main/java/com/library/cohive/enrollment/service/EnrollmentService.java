package com.library.cohive.enrollment.service;

import com.library.cohive.common.exception.ConflictException;
import com.library.cohive.common.exception.ForbiddenException;
import com.library.cohive.common.exception.ResourceNotFoundException;
import com.library.cohive.common.util.SecurityUtil;
import com.library.cohive.course.entity.Course;
import com.library.cohive.course.repository.CourseRepository;
import com.library.cohive.enrollment.dto.EnrollStudentRequest;
import com.library.cohive.enrollment.dto.EnrollmentResponse;
import com.library.cohive.enrollment.entity.Enrollment;
import com.library.cohive.enrollment.entity.EnrollmentId;
import com.library.cohive.enrollment.repository.EnrollmentRepository;
import com.library.cohive.organization.repository.OrganizationStudentRepository;
import com.library.cohive.student.entity.Student;
import com.library.cohive.student.repository.StudentRepository;
import com.library.cohive.user.entity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final OrganizationStudentRepository organizationStudentRepository;

    public EnrollmentResponse enrollStudent(EnrollStudentRequest request) {
        ensureOwnerRole();

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (!course.getOrganization().getOwner().getId().equals(SecurityUtil.getCurrentUserId())) {
            throw new ForbiddenException("Access denied");
        }

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        boolean isMember = organizationStudentRepository.existsByOrganization_IdAndStudent_Id(
                course.getOrganization().getId(), student.getId());
        if (!isMember) {
            throw new ForbiddenException("Student is not part of this organization");
        }

        if (enrollmentRepository.existsByCourse_IdAndStudent_Id(course.getId(), student.getId())) {
            throw new ConflictException("Student already enrolled");
        }

        Enrollment enrollment = Enrollment.builder()
                .id(new EnrollmentId(course.getId(), student.getId()))
                .course(course)
                .student(student)
                .build();
        return EnrollmentResponse.fromEntity(enrollmentRepository.save(enrollment));
    }

    public List<EnrollmentResponse> getCourseEnrollments(UUID courseId) {
        ensureOwnerRole();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (!course.getOrganization().getOwner().getId().equals(SecurityUtil.getCurrentUserId())) {
            throw new ForbiddenException("Access denied");
        }
        return enrollmentRepository.findByCourse_Id(courseId).stream()
            .map(EnrollmentResponse::fromEntity)
                .toList();
    }

    public List<EnrollmentResponse> getStudentEnrollments(UUID studentId) {
        Role role = SecurityUtil.getCurrentUserRole();
        if (role == Role.STUDENT) {
            Student student = studentRepository.findByUser_Id(SecurityUtil.getCurrentUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
            if (!student.getId().equals(studentId)) {
                throw new ForbiddenException("Access denied");
            }
        } else {
            studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
            boolean belongsToOwner = organizationStudentRepository
                    .existsByOrganization_Owner_IdAndStudent_Id(SecurityUtil.getCurrentUserId(), studentId);
            if (!belongsToOwner) {
                throw new ForbiddenException("Access denied");
            }
        }

        return enrollmentRepository.findByStudent_Id(studentId).stream()
                .filter(enrollment -> role == Role.STUDENT
                        || enrollment.getCourse().getOrganization().getOwner().getId().equals(SecurityUtil.getCurrentUserId()))
            .map(EnrollmentResponse::fromEntity)
                .toList();
    }

    private void ensureOwnerRole() {
        if (SecurityUtil.getCurrentUserRole() != Role.OWNER) {
            throw new ForbiddenException("Only organization owners can manage enrollments");
        }
    }
}
