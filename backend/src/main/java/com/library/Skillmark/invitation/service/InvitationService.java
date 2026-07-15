package com.library.Skillmark.invitation.service;

import com.library.Skillmark.audit.enums.AuditAction;
import com.library.Skillmark.audit.service.AuditLogService;
import com.library.Skillmark.common.exception.BusinessRuleException;
import com.library.Skillmark.common.exception.NotFoundException;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.common.util.TokenGenerator;
import com.library.Skillmark.email.service.EmailService;
import com.library.Skillmark.enrollment.entity.ProgramEnrollment;
import com.library.Skillmark.enrollment.enums.EnrollmentStatus;
import com.library.Skillmark.enrollment.repository.ProgramEnrollmentRepository;
import com.library.Skillmark.invitation.dto.CreateInvitationRequest;
import com.library.Skillmark.invitation.dto.InvitationPreviewResponse;
import com.library.Skillmark.invitation.dto.InvitationResponse;
import com.library.Skillmark.invitation.entity.InvitationLink;
import com.library.Skillmark.invitation.enums.InvitationStatus;
import com.library.Skillmark.invitation.repository.InvitationLinkRepository;
import com.library.Skillmark.membership.service.MembershipService;
import com.library.Skillmark.organization.enums.OrganizationStatus;
import com.library.Skillmark.program.enums.ProgramStatus;
import com.library.Skillmark.security.service.AuthorizationService;
import com.library.Skillmark.user.entity.User;
import com.library.Skillmark.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class InvitationService {
    private final InvitationLinkRepository invitationRepository;
    private final ProgramEnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final AuthorizationService authorizationService;
    private final AuditLogService auditLogService;
    private final EmailService emailService;
    private final MembershipService membershipService;
    private final String baseUrl;

    public InvitationService(InvitationLinkRepository invitationRepository,
                             ProgramEnrollmentRepository enrollmentRepository,
                             UserRepository userRepository,
                             AuthorizationService authorizationService,
                             AuditLogService auditLogService,
                             EmailService emailService,
                             MembershipService membershipService,
                             @Value("${app.base-url:}") String baseUrl) {
        this.invitationRepository = invitationRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.membershipService = membershipService;
        this.authorizationService = authorizationService;
        this.auditLogService = auditLogService;
        this.emailService = emailService;
        this.baseUrl = baseUrl == null || baseUrl.isBlank() ? "" : baseUrl.replaceAll("/$", "");
    }

    private String inviteUrl(String code) {
        return baseUrl + "/join/" + code;
    }

    @Transactional
    public InvitationResponse create(UUID programId, CreateInvitationRequest request, UUID actorId) {
        var program = authorizationService.ensureProgramOwner(programId, actorId);
        InvitationLink invitation = new InvitationLink();
        invitation.setProgram(program);
        invitation.setOrganization(program.getOrganization());
        invitation.setCode(uniqueCode());
        invitation.setDescription(request.description());
        invitation.setCreatedBy(userRepository.findById(actorId).orElseThrow(() -> new NotFoundException("User not found")));
        InvitationLink saved = invitationRepository.save(invitation);
        auditLogService.record(actorId, program.getOrganization().getId(), AuditAction.INVITATION_CREATED, "InvitationLink", saved.getId());
        sendInvitationEmails(saved, program.getTitle(), request.emails());
        return InvitationResponse.from(saved, inviteUrl(saved.getCode()));
    }

    private void sendInvitationEmails(InvitationLink invitation, String programName, List<String> emails) {
        if (emails == null || emails.isEmpty()) {
            return;
        }
        String link = inviteUrl(invitation.getCode());
        for (String email : emails) {
            emailService.sendInvitationEmail(email, programName, link);
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<InvitationResponse> list(UUID programId, UUID actorId, int page, int size) {
        authorizationService.ensureProgramOwner(programId, actorId);
        return PageResponse.fromList(invitationRepository.findByProgramId(programId).stream()
                .sorted(Comparator.comparing(InvitationLink::getCreatedAt).reversed())
                .map(invitation -> InvitationResponse.from(invitation, inviteUrl(invitation.getCode())))
                .toList(), page, size);
    }

    @Transactional(noRollbackFor = BusinessRuleException.class)
    public InvitationResponse join(String code, UUID userId) {
        InvitationLink invitation = invitationRepository.findByCode(code)
                .orElseThrow(() -> new NotFoundException("Invitation not found"));
        if (enrollmentRepository.existsByProgramIdAndUserIdAndStatus(invitation.getProgram().getId(), userId, EnrollmentStatus.ACTIVE)) {
            return InvitationResponse.from(invitation, inviteUrl(invitation.getCode()));
        }
        validateJoinable(invitation);
        User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        ensureActiveMembership(invitation, user);
        ProgramEnrollment enrollment = new ProgramEnrollment();
        enrollment.setProgram(invitation.getProgram());
        enrollment.setUser(user);
        enrollmentRepository.save(enrollment);
        auditLogService.record(userId, invitation.getOrganization().getId(), AuditAction.USER_ENROLLED, "InvitationLink", invitation.getId());
        return InvitationResponse.from(invitation, inviteUrl(invitation.getCode()));
    }

    @Transactional(readOnly = true)
    public InvitationPreviewResponse preview(String code) {
        InvitationLink invitation = invitationRepository.findByCode(code)
                .orElseThrow(() -> new NotFoundException("Invitation not found"));
        return InvitationPreviewResponse.from(invitation);
    }

    @Transactional
    public InvitationResponse disable(UUID invitationId, UUID actorId) {
        InvitationLink invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new NotFoundException("Invitation not found"));
        authorizationService.ensureOrganizationOwner(invitation.getOrganization().getId(), actorId);
        invitation.setStatus(InvitationStatus.DISABLED);
        invitation.setDisabledAt(Instant.now());
        auditLogService.record(actorId, invitation.getOrganization().getId(), AuditAction.INVITATION_DISABLED, "InvitationLink", invitationId);
        return InvitationResponse.from(invitation, inviteUrl(invitation.getCode()));
    }

    @Transactional
    public InvitationResponse updateStatus(UUID invitationId, InvitationStatus status, UUID actorId) {
        if (status != InvitationStatus.DISABLED) {
            throw new BusinessRuleException("Invitation status can only be changed to DISABLED");
        }
        return disable(invitationId, actorId);
    }

    private void validateJoinable(InvitationLink invitation) {
        if (invitation.getStatus() != InvitationStatus.ACTIVE) {
            throw new BusinessRuleException("Invitation is not active");
        }
        if (invitation.getProgram().getStatus() != ProgramStatus.PUBLISHED || invitation.getProgram().getDeletedAt() != null) {
            throw new BusinessRuleException("Program is not joinable");
        }
        if (invitation.getOrganization().getDeletedAt() != null
                || invitation.getOrganization().getStatus() == OrganizationStatus.DELETED) {
            throw new BusinessRuleException("Organization is not joinable");
        }
    }

    private void ensureActiveMembership(InvitationLink invitation, User user) {
        membershipService.ensureActiveMembership(
                invitation.getOrganization(), user, invitation.getCreatedBy());
    }

    private String uniqueCode() {
        String code;
        do {
            code = TokenGenerator.randomUppercase(12);
        } while (invitationRepository.existsByCode(code));
        return code;
    }
}
