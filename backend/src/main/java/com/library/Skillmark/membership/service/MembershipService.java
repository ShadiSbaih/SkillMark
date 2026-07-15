package com.library.Skillmark.membership.service;

import com.library.Skillmark.membership.controller.*;
import com.library.Skillmark.membership.dto.*;
import com.library.Skillmark.membership.entity.*;
import com.library.Skillmark.membership.enums.*;
import com.library.Skillmark.membership.repository.*;
import com.library.Skillmark.membership.service.*;
import com.library.Skillmark.audit.enums.AuditAction;
import com.library.Skillmark.audit.service.AuditLogService;
import com.library.Skillmark.common.exception.BadRequestException;
import com.library.Skillmark.common.exception.ConflictException;
import com.library.Skillmark.common.exception.NotFoundException;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.organization.entity.Organization;
import com.library.Skillmark.organization.repository.OrganizationRepository;
import com.library.Skillmark.security.service.AuthorizationService;
import com.library.Skillmark.user.entity.User;
import com.library.Skillmark.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.UUID;

@Service
public class MembershipService {
    private final OrganizationMembershipRepository membershipRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final AuthorizationService authorizationService;
    private final AuditLogService auditLogService;

    public MembershipService(OrganizationMembershipRepository membershipRepository,
                             OrganizationRepository organizationRepository,
                             UserRepository userRepository,
                             AuthorizationService authorizationService,
                             AuditLogService auditLogService) {
        this.membershipRepository = membershipRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.authorizationService = authorizationService;
        this.auditLogService = auditLogService;
    }

    /**
     * Returns an active membership for the user in the organization, creating one
     * (PARTICIPANT) or reactivating a previously removed one as needed. This is the
     * single source of truth used by invitations, enrollments, and member adds.
     */
    @Transactional
    public OrganizationMembership ensureActiveMembership(Organization organization, User user, User invitedBy) {
        var existing = membershipRepository.findByOrganizationIdAndUserId(organization.getId(), user.getId());
        if (existing.isPresent()) {
            OrganizationMembership membership = existing.get();
            if (membership.getRole() == null) {
                membership.setRole(MembershipRole.PARTICIPANT);
            }
            if (membership.getStatus() != MembershipStatus.ACTIVE) {
                membership.setStatus(MembershipStatus.ACTIVE);
                membership.setRemovedBy(null);
                membership.setRemovedAt(null);
            }
            return membershipRepository.save(membership);
        }
        OrganizationMembership membership = new OrganizationMembership();
        membership.setOrganization(organization);
        membership.setUser(user);
        membership.setRole(MembershipRole.PARTICIPANT);
        membership.setStatus(MembershipStatus.ACTIVE);
        membership.setInvitedBy(invitedBy);
        return membershipRepository.save(membership);
    }

    @Transactional
    public MembershipResponse add(UUID organizationId, AddMemberRequest request, UUID actorId) {
        authorizationService.ensureOrganizationOwner(organizationId, actorId);
        if (request.role() != MembershipRole.PARTICIPANT) {
            throw new BadRequestException("Only PARTICIPANT can be added manually in the MVP");
        }
        var organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new NotFoundException("Organization not found"));
        var actor = userRepository.findById(actorId).orElseThrow(() -> new NotFoundException("User not found"));
        var user = userRepository.findById(request.userId()).orElseThrow(() -> new NotFoundException("User not found"));
        var existing = membershipRepository.findByOrganizationIdAndUserId(organizationId, request.userId());
        if (existing.isPresent()) {
            OrganizationMembership membership = existing.get();
            if (membership.getStatus() == MembershipStatus.ACTIVE) {
                throw new ConflictException("Active membership already exists");
            }
            membership.setStatus(MembershipStatus.ACTIVE);
            membership.setRole(MembershipRole.PARTICIPANT);
            membership.setInvitedBy(actor);
            membership.setJoinedAt(java.time.Instant.now());
            membership.setRemovedBy(null);
            membership.setRemovedAt(null);
            OrganizationMembership saved = membershipRepository.save(membership);
            auditLogService.record(actorId, organizationId, AuditAction.MEMBER_ADDED, "User", request.userId());
            return MembershipResponse.from(saved);
        }
        OrganizationMembership membership = new OrganizationMembership();
        membership.setOrganization(organization);
        membership.setUser(user);
        membership.setRole(MembershipRole.PARTICIPANT);
        membership.setStatus(MembershipStatus.ACTIVE);
        membership.setInvitedBy(actor);
        membership.setJoinedAt(java.time.Instant.now());
        membership.setRemovedBy(null);
        membership.setRemovedAt(null);
        OrganizationMembership saved = membershipRepository.save(membership);
        auditLogService.record(actorId, organizationId, AuditAction.MEMBER_ADDED, "User", request.userId());
        return MembershipResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<MembershipResponse> list(UUID organizationId, UUID actorId, int page, int size) {
        authorizationService.ensureOrganizationOwner(organizationId, actorId);
        var members = membershipRepository.findByOrganizationId(organizationId).stream()
                .sorted(Comparator.comparing(OrganizationMembership::getCreatedAt).reversed())
                .map(MembershipResponse::from)
                .toList();
        return PageResponse.fromList(members, page, size);
    }

    @Transactional
    public void remove(UUID organizationId, UUID userId, UUID actorId) {
        authorizationService.ensureOrganizationOwner(organizationId, actorId);
        OrganizationMembership membership = membershipRepository.findByOrganizationIdAndUserIdAndStatus(organizationId, userId, MembershipStatus.ACTIVE)
                .orElseThrow(() -> new NotFoundException("Membership not found"));
        if (membership.getRole() == MembershipRole.OWNER) {
            throw new BadRequestException("Owner membership cannot be removed in the MVP");
        }
        membership.setStatus(MembershipStatus.REMOVED);
        membership.setRemovedBy(userRepository.findById(actorId).orElseThrow(() -> new NotFoundException("User not found")));
        membership.setRemovedAt(java.time.Instant.now());
        auditLogService.record(actorId, organizationId, AuditAction.MEMBER_REMOVED, "User", userId);
    }
}
