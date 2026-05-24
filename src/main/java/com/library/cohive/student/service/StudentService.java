package com.library.cohive.student.service;

import com.library.cohive.common.exception.ConflictException;
import com.library.cohive.common.exception.ForbiddenException;
import com.library.cohive.common.exception.ResourceNotFoundException;
import com.library.cohive.common.util.SecurityUtil;
import com.library.cohive.organization.entity.Organization;
import com.library.cohive.organization.entity.OrganizationStudent;
import com.library.cohive.organization.entity.OrganizationStudentId;
import com.library.cohive.organization.repository.OrganizationRepository;
import com.library.cohive.organization.repository.OrganizationStudentRepository;
import com.library.cohive.student.dto.CreateStudentRequest;
import com.library.cohive.student.dto.StudentResponse;
import com.library.cohive.student.entity.Student;
import com.library.cohive.student.repository.StudentRepository;
import com.library.cohive.user.entity.Role;
import com.library.cohive.user.entity.User;
import com.library.cohive.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationStudentRepository organizationStudentRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public StudentResponse createStudent(CreateStudentRequest request) {
        ensureOwnerRole();

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already in use");
        }

        Organization organization = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        if (!organization.getOwner().getId().equals(SecurityUtil.getCurrentUserId())) {
            throw new ForbiddenException("Access denied");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .build();

        User savedUser = userRepository.save(user);
        Student student = Student.builder()
                .user(savedUser)
                .build();

        Student savedStudent = studentRepository.save(student);
        OrganizationStudent membership = OrganizationStudent.builder()
                .id(new OrganizationStudentId(organization.getId(), savedStudent.getId()))
                .organization(organization)
                .student(savedStudent)
                .build();
        organizationStudentRepository.save(membership);

        return StudentResponse.fromEntity(savedStudent);
    }

    @Transactional(readOnly = true)
    public Page<StudentResponse> getStudents(Pageable pageable) {
        ensureOwnerRole();

        UUID ownerId = SecurityUtil.getCurrentUserId();
        List<UUID> organizationIds = organizationRepository.findByOwner_Id(ownerId).stream()
                .map(Organization::getId)
                .toList();

        if (organizationIds.isEmpty()) {
            return Page.empty(pageable);
        }

        Set<UUID> studentIds = organizationStudentRepository.findByOrganization_IdIn(organizationIds).stream()
                .map(OrganizationStudent::getStudent)
                .map(Student::getId)
                .collect(Collectors.toSet());

        if (studentIds.isEmpty()) {
            return Page.empty(pageable);
        }

        List<StudentResponse> content = studentRepository.findAllById(studentIds).stream()
            .map(StudentResponse::fromEntity)
            .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), content.size());
        List<StudentResponse> pageItems = start >= content.size()
            ? List.of()
            : content.subList(start, end);

        return new PageImpl<>(pageItems, pageable, content.size());
    }

    @Transactional(readOnly = true)
    public StudentResponse getStudent(UUID studentId) {
        Role role = SecurityUtil.getCurrentUserRole();
        if (role == Role.STUDENT) {
            Student currentStudent = getCurrentStudentEntity();
            if (!currentStudent.getId().equals(studentId)) {
                throw new ForbiddenException("Access denied");
            }
            return StudentResponse.fromEntity(currentStudent);
        }

        UUID ownerId = SecurityUtil.getCurrentUserId();
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        boolean belongsToOwner = organizationStudentRepository
                .existsByOrganization_Owner_IdAndStudent_Id(ownerId, studentId);
        if (!belongsToOwner) {
            throw new ForbiddenException("Access denied");
        }
        return StudentResponse.fromEntity(student);
    }

    public Student getCurrentStudentEntity() {
        UUID userId = SecurityUtil.getCurrentUserId();
        return studentRepository.findByUser_Id(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
    }

    private void ensureOwnerRole() {
        if (SecurityUtil.getCurrentUserRole() != Role.OWNER) {
            throw new ForbiddenException("Only organization owners can manage students");
        }
    }
}
