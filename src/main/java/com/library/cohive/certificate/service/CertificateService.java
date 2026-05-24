package com.library.cohive.certificate.service;

import com.library.cohive.certificate.dto.CertificateResponse;
import com.library.cohive.certificate.dto.IssueCertificateRequest;
import com.library.cohive.certificate.entity.Certificate;
import com.library.cohive.certificate.repository.CertificateRepository;
import com.library.cohive.common.exception.ConflictException;
import com.library.cohive.common.exception.ForbiddenException;
import com.library.cohive.common.exception.ResourceNotFoundException;
import com.library.cohive.common.util.SecurityUtil;
import com.library.cohive.course.entity.Course;
import com.library.cohive.course.repository.CourseRepository;
import com.library.cohive.enrollment.repository.EnrollmentRepository;
import com.library.cohive.organization.repository.OrganizationStudentRepository;
import com.library.cohive.student.entity.Student;
import com.library.cohive.student.repository.StudentRepository;
import com.library.cohive.user.entity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CertificateService {
    private final CertificateRepository certificateRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final OrganizationStudentRepository organizationStudentRepository;

    @Transactional
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
                .certificateCode(generateCertificateCode())
                .verificationUrl("")
                .issuedAt(Instant.now())
                .course(course)
                .student(student)
                .build();

        certificate.setVerificationUrl("/api/v1/certificates/verify/" + certificate.getCertificateCode());

        return CertificateResponse.fromEntity(certificateRepository.save(certificate));
    }

    @Transactional(readOnly = true)
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

    @Transactional(readOnly = true)
    public CertificateResponse verifyCertificate(String certificateCode) {
        Certificate certificate = certificateRepository.findByCertificateCode(certificateCode)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));
        return CertificateResponse.fromEntity(certificate);
    }

    private void ensureOwnerRole() {
        if (SecurityUtil.getCurrentUserRole() != Role.OWNER) {
            throw new ForbiddenException("Only organization owners can issue certificates");
        }
    }

    private String generateCertificateCode() {
        String year = String.valueOf(Instant.now().atZone(ZoneOffset.UTC).getYear());
        String code;
        do {
            code = "COHIVE-" + year + "-" + UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 8)
                    .toUpperCase(Locale.ROOT);
        } while (certificateRepository.existsByCertificateCode(code));
        return code;
    }
}
