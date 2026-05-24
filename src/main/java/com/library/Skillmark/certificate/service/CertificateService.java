package com.library.Skillmark.certificate.service;

import com.library.Skillmark.certificate.dto.CertificateResponse;
import com.library.Skillmark.certificate.dto.IssueCertificateRequest;
import com.library.Skillmark.certificate.entity.Certificate;
import com.library.Skillmark.certificate.repository.CertificateRepository;
import com.library.Skillmark.common.exception.ConflictException;
import com.library.Skillmark.common.exception.ForbiddenException;
import com.library.Skillmark.common.exception.ResourceNotFoundException;
import com.library.Skillmark.common.util.SecurityUtil;
import com.library.Skillmark.course.entity.Course;
import com.library.Skillmark.course.repository.CourseRepository;
import com.library.Skillmark.enrollment.repository.EnrollmentRepository;
import com.library.Skillmark.organization.repository.OrganizationStudentRepository;
import com.library.Skillmark.student.entity.Student;
import com.library.Skillmark.student.repository.StudentRepository;
import com.library.Skillmark.user.entity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CertificateService {
    private final CertificateRepository certificateRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final OrganizationStudentRepository organizationStudentRepository;

    public CertificateResponse issueCertificate(IssueCertificateRequest request) {
        ensureOwnerRole();

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (!course.getOrganization().getOwner().getId().equals(SecurityUtil.getCurrentUserId())) {
            throw new ForbiddenException("Access denied");
        }

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        boolean member = organizationStudentRepository.existsByOrganization_IdAndStudent_Id(
                course.getOrganization().getId(), student.getId());
        if (!member) {
            throw new ForbiddenException("Student is not part of this organization");
        }

        boolean enrolled = enrollmentRepository.existsByCourse_IdAndStudent_Id(course.getId(), student.getId());
        if (!enrolled) {
            throw new ForbiddenException("Student is not enrolled in this course");
        }

        if (certificateRepository.existsByCourse_IdAndStudent_Id(course.getId(), student.getId())) {
            throw new ConflictException("Certificate already issued for this course");
        }

        String title = StringUtils.hasText(request.getTitle())
                ? request.getTitle().trim()
                : "Certificate of Completion - " + course.getTitle();

        Certificate certificate = Certificate.builder()
                .title(title)
                .course(course)
                .student(student)
                .build();

        return CertificateResponse.fromEntity(certificateRepository.save(certificate));
    }

    public List<CertificateResponse> getStudentCertificates(UUID studentId) {
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

        return certificateRepository.findByStudent_Id(studentId).stream()
                .filter(certificate -> role == Role.STUDENT
                        || certificate.getCourse().getOrganization().getOwner().getId().equals(SecurityUtil.getCurrentUserId()))
            .map(CertificateResponse::fromEntity)
                .toList();
    }

    private void ensureOwnerRole() {
        if (SecurityUtil.getCurrentUserRole() != Role.OWNER) {
            throw new ForbiddenException("Only organization owners can issue certificates");
        }
    }
}
