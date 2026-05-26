package com.library.Skillmark.organization.service;

import com.library.Skillmark.organization.controller.*;
import com.library.Skillmark.organization.dto.*;
import com.library.Skillmark.organization.entity.*;
import com.library.Skillmark.organization.enums.*;
import com.library.Skillmark.organization.repository.*;
import com.library.Skillmark.organization.service.*;
import com.library.Skillmark.audit.enums.AuditAction;
import com.library.Skillmark.audit.service.AuditLogService;
import com.library.Skillmark.common.exception.NotFoundException;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.membership.controller.*;
import com.library.Skillmark.membership.dto.*;
import com.library.Skillmark.membership.entity.*;
import com.library.Skillmark.membership.enums.*;
import com.library.Skillmark.membership.repository.*;
import com.library.Skillmark.membership.service.*;
import com.library.Skillmark.security.service.AuthorizationService;
import com.library.Skillmark.user.entity.User;
import com.library.Skillmark.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.UUID;

@Service
public class OrganizationService {
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final OrganizationMembershipRepository membershipRepository;
    private final AuthorizationService authorizationService;
    private final AuditLogService auditLogService;

    public OrganizationService(OrganizationRepository organizationRepository,
                               UserRepository userRepository,
                               OrganizationMembershipRepository membershipRepository,
                               AuthorizationService authorizationService,
                               AuditLogService auditLogService) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.membershipRepository = membershipRepository;
        this.authorizationService = authorizationService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public OrganizationResponse create(CreateOrganizationRequest request, UUID userId) {
        User owner = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        Organization organization = new Organization();
        organization.setName(request.name().trim());
        organization.setDescription(request.description());
        organization.setLogoUrl(request.logoUrl());
        organization.setOwner(owner);
        Organization saved = organizationRepository.save(organization);

        OrganizationMembership membership = new OrganizationMembership();
        membership.setOrganization(saved);
        membership.setUser(owner);
        membership.setRole(MembershipRole.OWNER);
        membership.setInvitedBy(owner);
        membershipRepository.save(membership);
        auditLogService.record(userId, saved.getId(), AuditAction.ORGANIZATION_CREATED, "Organization", saved.getId());
        return OrganizationResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrganizationResponse> list(UUID userId, int page, int size) {
        var organizations = membershipRepository.findByUserIdAndStatus(userId, MembershipStatus.ACTIVE).stream()
                .map(OrganizationMembership::getOrganization)
                .filter(org -> org.getStatus() != OrganizationStatus.DELETED)
                .distinct()
                .sorted(Comparator.comparing(Organization::getCreatedAt).reversed())
                .map(OrganizationResponse::from)
                .toList();
        return PageResponse.fromList(organizations, page, size);
    }

    @Transactional(readOnly = true)
    public OrganizationResponse get(UUID organizationId, UUID userId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new NotFoundException("Organization not found"));
        authorizationService.ensureOrganizationMember(organizationId, userId);
        return OrganizationResponse.from(organization);
    }

    @Transactional
    public OrganizationResponse update(UUID organizationId, UpdateOrganizationRequest request, UUID userId) {
        authorizationService.ensureOrganizationOwner(organizationId, userId);
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new NotFoundException("Organization not found"));
        organization.setName(request.name().trim());
        organization.setDescription(request.description());
        organization.setLogoUrl(request.logoUrl());
        auditLogService.record(userId, organizationId, AuditAction.ORGANIZATION_UPDATED, "Organization", organizationId);
        return OrganizationResponse.from(organization);
    }

    @Transactional
    public void delete(UUID organizationId, UUID userId) {
        authorizationService.ensureOrganizationOwner(organizationId, userId);
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new NotFoundException("Organization not found"));
        organization.setStatus(OrganizationStatus.DELETED);
        organization.setDeletedAt(Instant.now());
        auditLogService.record(userId, organizationId, AuditAction.ORGANIZATION_DELETED, "Organization", organizationId);
    }
}
