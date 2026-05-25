package com.library.Skillmark.invitation.service;

import com.library.Skillmark.audit.enums.AuditAction;
import com.library.Skillmark.audit.service.AuditLogService;
import com.library.Skillmark.common.exception.BusinessRuleException;
import com.library.Skillmark.common.exception.ConflictException;
import com.library.Skillmark.common.exception.NotFoundException;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.enrollment.entity.ProgramEnrollment;
import com.library.Skillmark.enrollment.enums.EnrollmentStatus;
import com.library.Skillmark.enrollment.repository.ProgramEnrollmentRepository;
import com.library.Skillmark.invitation.dto.CreateInvitationRequest;
import com.library.Skillmark.invitation.dto.InvitationResponse;
import com.library.Skillmark.invitation.entity.InvitationLink;
import com.library.Skillmark.invitation.enums.InvitationStatus;
import com.library.Skillmark.invitation.repository.InvitationLinkRepository;
import com.library.Skillmark.membership.entity.OrganizationMembership;
import com.library.Skillmark.membership.enums.MembershipRole;
import com.library.Skillmark.membership.enums.MembershipStatus;
import com.library.Skillmark.membership.repository.OrganizationMembershipRepository;
import com.library.Skillmark.program.enums.ProgramStatus;
import com.library.Skillmark.security.service.AuthorizationService;
import com.library.Skillmark.user.entity.User;
import com.library.Skillmark.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.UUID;

@Service
public class InvitationService {
    private final InvitationLinkRepository invitationRepository;
    private final ProgramEnrollmentRepository enrollmentRepository;
    private final OrganizationMembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final AuthorizationService authorizationService;
    private final AuditLogService auditLogService;

    public InvitationService(InvitationLinkRepository invitationRepository,
                             ProgramEnrollmentRepository enrollmentRepository,
                             OrganizationMembershipRepository membershipRepository,
                             UserRepository userRepository,
                             AuthorizationService authorizationService,
                             AuditLogService auditLogService) {
        this.invitationRepository = invitationRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.membershipRepository = membershipRepository;
        this.userRepository = userRepository;
        this.authorizationService = authorizationService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public InvitationResponse create(UUID programId, CreateInvitationRequest request, UUID actorId) {
        var program = authorizationService.ensureProgramOwner(programId, actorId);
        InvitationLink invitation = new InvitationLink();
        invitation.setProgram(program);
        invitation.setOrganization(program.getOrganization());
        invitation.setCode(uniqueCode());
        invitation.setMaxUses(request.maxUses());
        invitation.setExpiresAt(request.expiresAt());
        invitation.setCreatedBy(userRepository.findById(actorId).orElseThrow(() -> new NotFoundException("User not found")));
        InvitationLink saved = invitationRepository.save(invitation);
        auditLogService.record(actorId, program.getOrganization().getId(), AuditAction.INVITATION_CREATED, "InvitationLink", saved.getId());
        return InvitationResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<InvitationResponse> list(UUID programId, UUID actorId, int page, int size) {
        authorizationService.ensureProgramOwner(programId, actorId);
        return PageResponse.fromList(invitationRepository.findByProgramId(programId).stream()
                .sorted(Comparator.comparing(InvitationLink::getCreatedAt).reversed())
                .map(InvitationResponse::from)
                .toList(), page, size);
    }

    @Transactional(noRollbackFor = BusinessRuleException.class)
    public InvitationResponse join(String code, UUID userId) {
        InvitationLink invitation = invitationRepository.findByCode(code)
                .orElseThrow(() -> new NotFoundException("Invitation not found"));
        validateJoinable(invitation);
        if (enrollmentRepository.existsByProgramIdAndUserIdAndStatus(invitation.getProgram().getId(), userId, EnrollmentStatus.ACTIVE)) {
            throw new ConflictException("User is already actively enrolled in this program");
        }
        User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        ensureActiveMembership(invitation, user);
        ProgramEnrollment enrollment = new ProgramEnrollment();
        enrollment.setProgram(invitation.getProgram());
        enrollment.setUser(user);
        enrollmentRepository.save(enrollment);
        invitation.setUsedCount(invitation.getUsedCount() + 1);
        auditLogService.record(userId, invitation.getOrganization().getId(), AuditAction.USER_ENROLLED, "InvitationLink", invitation.getId());
        return InvitationResponse.from(invitation);
    }

    @Transactional
    public InvitationResponse disable(UUID invitationId, UUID actorId) {
        InvitationLink invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new NotFoundException("Invitation not found"));
        authorizationService.ensureOrganizationOwner(invitation.getOrganization().getId(), actorId);
        invitation.setStatus(InvitationStatus.DISABLED);
        auditLogService.record(actorId, invitation.getOrganization().getId(), AuditAction.INVITATION_DISABLED, "InvitationLink", invitationId);
        return InvitationResponse.from(invitation);
    }

    private void validateJoinable(InvitationLink invitation) {
        if (invitation.getStatus() != InvitationStatus.ACTIVE) {
            throw new BusinessRuleException("Invitation is not active");
        }
        if (invitation.getExpiresAt() != null && invitation.getExpiresAt().isBefore(Instant.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            throw new BusinessRuleException("Invitation has expired");
        }
        if (invitation.getMaxUses() != null && invitation.getUsedCount() >= invitation.getMaxUses()) {
            throw new BusinessRuleException("Invitation usage limit reached");
        }
        if (!invitation.getProgram().isPublished() || invitation.getProgram().getStatus() != ProgramStatus.PUBLISHED) {
            throw new BusinessRuleException("Program is not joinable");
        }
    }

    private void ensureActiveMembership(InvitationLink invitation, User user) {
        var existing = membershipRepository.findByOrganizationIdAndUserId(invitation.getOrganization().getId(), user.getId());
        if (existing.isPresent()) {
            OrganizationMembership membership = existing.get();
            if (membership.getRole() == null) {
                membership.setRole(MembershipRole.PARTICIPANT);
            }
            if (membership.getStatus() != MembershipStatus.ACTIVE) {
                membership.setStatus(MembershipStatus.ACTIVE);
            }
            return;
        }
        OrganizationMembership membership = new OrganizationMembership();
        membership.setOrganization(invitation.getOrganization());
        membership.setUser(user);
        membership.setRole(MembershipRole.PARTICIPANT);
        membership.setStatus(MembershipStatus.ACTIVE);
        membershipRepository.save(membership);
    }

    private String uniqueCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        } while (invitationRepository.existsByCode(code));
        return code;
    }
}
