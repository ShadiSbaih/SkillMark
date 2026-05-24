package com.library.Skillmark.organization.service;

import com.library.Skillmark.common.exception.ConflictException;
import com.library.Skillmark.common.exception.ForbiddenException;
import com.library.Skillmark.common.exception.ResourceNotFoundException;
import com.library.Skillmark.common.util.PageUtils;
import com.library.Skillmark.common.util.SecurityUtil;
import com.library.Skillmark.organization.dto.AddOrganizationStudentRequest;
import com.library.Skillmark.organization.dto.CreateOrganizationRequest;
import com.library.Skillmark.organization.dto.OrganizationResponse;
import com.library.Skillmark.organization.entity.Organization;
import com.library.Skillmark.organization.entity.OrganizationStudent;
import com.library.Skillmark.organization.entity.OrganizationStudentId;
import com.library.Skillmark.organization.repository.OrganizationRepository;
import com.library.Skillmark.organization.repository.OrganizationStudentRepository;
import com.library.Skillmark.student.dto.StudentResponse;
import com.library.Skillmark.student.entity.Student;
import com.library.Skillmark.student.repository.StudentRepository;
import com.library.Skillmark.user.entity.Role;
import com.library.Skillmark.user.entity.User;
import com.library.Skillmark.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrganizationService {
    private final OrganizationRepository organizationRepository;
    private final OrganizationStudentRepository organizationStudentRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    public OrganizationResponse createOrganization(CreateOrganizationRequest request) {
        ensureOwnerRole();

        User owner = getCurrentUser();
        Organization organization = Organization.builder()
                .name(request.getName())
                .owner(owner)
                .build();

        return OrganizationResponse.fromEntity(organizationRepository.save(organization));
    }

    public Page<OrganizationResponse> getOrganizations(Pageable pageable) {
        Role role = SecurityUtil.getCurrentUserRole();
        List<Organization> organizations;

        if (role == Role.OWNER) {
            organizations = organizationRepository.findByOwner_Id(SecurityUtil.getCurrentUserId());
        } else {
            Student student = studentRepository.findByUser_Id(SecurityUtil.getCurrentUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
            organizations = organizationStudentRepository.findByStudent_Id(student.getId()).stream()
                    .map(OrganizationStudent::getOrganization)
                    .toList();
        }

        List<OrganizationResponse> content = organizations.stream()
            .map(OrganizationResponse::fromEntity)
            .toList();
        return PageUtils.page(content, pageable);
    }

    public OrganizationResponse getOrganization(UUID organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        Role role = SecurityUtil.getCurrentUserRole();
        if (role == Role.OWNER) {
            verifyOwner(organization);
        } else {
            Student student = studentRepository.findByUser_Id(SecurityUtil.getCurrentUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
            boolean member = organizationStudentRepository
                    .existsByOrganization_IdAndStudent_Id(organizationId, student.getId());
            if (!member) {
                throw new ForbiddenException("Access denied");
            }
        }

        return OrganizationResponse.fromEntity(organization);
    }

    public void deleteOrganization(UUID organizationId) {
        ensureOwnerRole();
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        verifyOwner(organization);
        organizationRepository.delete(organization);
    }

    public void addStudent(UUID organizationId, AddOrganizationStudentRequest request) {
        ensureOwnerRole();

        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        verifyOwner(organization);

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        boolean exists = organizationStudentRepository
                .existsByOrganization_IdAndStudent_Id(organizationId, student.getId());
        if (exists) {
            throw new ConflictException("Student already added to organization");
        }

        OrganizationStudent membership = OrganizationStudent.builder()
                .id(new OrganizationStudentId(organizationId, student.getId()))
                .organization(organization)
                .student(student)
                .build();
        organizationStudentRepository.save(membership);
    }

    public Page<StudentResponse> getOrganizationStudents(UUID organizationId, Pageable pageable) {
        ensureOwnerRole();
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        verifyOwner(organization);

        List<StudentResponse> content = organizationStudentRepository.findByOrganization_Id(organizationId)
            .stream()
            .map(OrganizationStudent::getStudent)
            .map(StudentResponse::fromEntity)
            .toList();
        return PageUtils.page(content, pageable);
    }

    private void ensureOwnerRole() {
        if (SecurityUtil.getCurrentUserRole() != Role.OWNER) {
            throw new ForbiddenException("Only organization owners can perform this action");
        }
    }

    private void verifyOwner(Organization organization) {
        UUID ownerId = SecurityUtil.getCurrentUserId();
        if (!organization.getOwner().getId().equals(ownerId)) {
            throw new ForbiddenException("Access denied");
        }
    }

    private User getCurrentUser() {
        UUID userId = SecurityUtil.getCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
