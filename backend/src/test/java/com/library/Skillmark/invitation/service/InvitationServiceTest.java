package com.library.Skillmark.invitation.service;

import com.library.Skillmark.audit.enums.AuditAction;
import com.library.Skillmark.audit.service.AuditLogService;
import com.library.Skillmark.common.exception.BusinessRuleException;
import com.library.Skillmark.common.exception.NotFoundException;
import com.library.Skillmark.common.response.PageResponse;
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
import com.library.Skillmark.organization.entity.Organization;
import com.library.Skillmark.program.entity.Program;
import com.library.Skillmark.program.enums.ProgramStatus;
import com.library.Skillmark.security.service.AuthorizationService;
import com.library.Skillmark.user.entity.User;
import com.library.Skillmark.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvitationServiceTest {

    @Mock
    private InvitationLinkRepository invitationRepository;
    @Mock
    private ProgramEnrollmentRepository enrollmentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AuthorizationService authorizationService;
    @Mock
    private AuditLogService auditLogService;
    @Mock
    private EmailService emailService;
    @Mock
    private MembershipService membershipService;

    private InvitationService invitationService;

    @BeforeEach
    void setUp() {
        invitationService = new InvitationService(
                invitationRepository,
                enrollmentRepository,
                userRepository,
                authorizationService,
                auditLogService,
                emailService,
                membershipService,
                "http://localhost:4200"
        );
    }

    @Test
    void create_ShouldSaveInvitationAndReturnResponse() {
        UUID programId = UUID.randomUUID();
        UUID actorId = UUID.randomUUID();
        Organization org = new Organization();
        ReflectionTestUtils.setField(org, "id", UUID.randomUUID());
        Program program = new Program();
        ReflectionTestUtils.setField(program, "id", programId);
        program.setOrganization(org);
        program.setTitle("Test Program");
        User actor = new User();
        ReflectionTestUtils.setField(actor, "id", actorId);

        when(authorizationService.ensureProgramOwner(programId, actorId)).thenReturn(program);
        when(userRepository.findById(actorId)).thenReturn(Optional.of(actor));
        when(invitationRepository.save(any(InvitationLink.class))).thenAnswer(invocation -> {
            InvitationLink link = invocation.getArgument(0);
            ReflectionTestUtils.setField(link, "id", UUID.randomUUID());
            return link;
        });

        CreateInvitationRequest request = new CreateInvitationRequest("desc", List.of("test@example.com"));
        InvitationResponse response = invitationService.create(programId, request, actorId);

        assertThat(response).isNotNull();
        assertThat(response.inviteUrl()).startsWith("http://localhost:4200/join/");
        verify(invitationRepository).save(any(InvitationLink.class));
        verify(auditLogService).record(eq(actorId), eq(org.getId()), eq(AuditAction.INVITATION_CREATED), eq("InvitationLink"), any(UUID.class));
        verify(emailService).sendInvitationEmail(eq("test@example.com"), eq("Test Program"), anyString());
    }

    @Test
    void join_ShouldEnrollUser_WhenValidInvitation() {
        UUID userId = UUID.randomUUID();
        String code = "validCode";
        User user = new User();
        ReflectionTestUtils.setField(user, "id", userId);
        
        Organization org = new Organization();
        ReflectionTestUtils.setField(org, "id", UUID.randomUUID());
        
        Program program = new Program();
        ReflectionTestUtils.setField(program, "id", UUID.randomUUID());
        program.setStatus(ProgramStatus.PUBLISHED);
        
        InvitationLink invitation = new InvitationLink();
        ReflectionTestUtils.setField(invitation, "id", UUID.randomUUID());
        invitation.setCode(code);
        invitation.setStatus(InvitationStatus.ACTIVE);
        invitation.setProgram(program);
        invitation.setOrganization(org);

        when(invitationRepository.findByCode(code)).thenReturn(Optional.of(invitation));
        when(enrollmentRepository.existsByProgramIdAndUserIdAndStatus(program.getId(), userId, EnrollmentStatus.ACTIVE)).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        InvitationResponse response = invitationService.join(code, userId);

        assertThat(response).isNotNull();
        verify(membershipService).ensureActiveMembership(eq(org), eq(user), any());
        verify(enrollmentRepository).save(any(ProgramEnrollment.class));
        verify(auditLogService).record(eq(userId), eq(org.getId()), eq(AuditAction.USER_ENROLLED), eq("InvitationLink"), eq(invitation.getId()));
    }

    @Test
    void join_ShouldThrowException_WhenInvitationNotActive() {
        UUID userId = UUID.randomUUID();
        String code = "invalidCode";
        InvitationLink invitation = new InvitationLink();
        invitation.setCode(code);
        invitation.setStatus(InvitationStatus.DISABLED);
        Program program = new Program();
        ReflectionTestUtils.setField(program, "id", UUID.randomUUID());
        invitation.setProgram(program);

        when(invitationRepository.findByCode(code)).thenReturn(Optional.of(invitation));

        assertThatThrownBy(() -> invitationService.join(code, userId))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Invitation is not active");
    }

    @Test
    void preview_ShouldReturnPreviewInfo() {
        String code = "someCode";
        InvitationLink invitation = new InvitationLink();
        ReflectionTestUtils.setField(invitation, "id", UUID.randomUUID());
        invitation.setCode(code);
        Organization org = new Organization();
        org.setName("Org Name");
        invitation.setOrganization(org);
        Program program = new Program();
        program.setTitle("Program Title");
        invitation.setProgram(program);

        when(invitationRepository.findByCode(code)).thenReturn(Optional.of(invitation));

        InvitationPreviewResponse preview = invitationService.preview(code);

        assertThat(preview).isNotNull();
        assertThat(preview.organizationName()).isEqualTo("Org Name");
        assertThat(preview.programTitle()).isEqualTo("Program Title");
    }

    @Test
    void disable_ShouldDisableInvitation() {
        UUID invitationId = UUID.randomUUID();
        UUID actorId = UUID.randomUUID();
        Organization org = new Organization();
        ReflectionTestUtils.setField(org, "id", UUID.randomUUID());
        Program program = new Program();
        ReflectionTestUtils.setField(program, "id", UUID.randomUUID());
        InvitationLink invitation = new InvitationLink();
        ReflectionTestUtils.setField(invitation, "id", invitationId);
        invitation.setOrganization(org);
        invitation.setProgram(program);
        invitation.setStatus(InvitationStatus.ACTIVE);

        when(invitationRepository.findById(invitationId)).thenReturn(Optional.of(invitation));

        InvitationResponse response = invitationService.disable(invitationId, actorId);

        assertThat(response.status()).isEqualTo(InvitationStatus.DISABLED);
        verify(authorizationService).ensureOrganizationOwner(org.getId(), actorId);
        verify(auditLogService).record(eq(actorId), eq(org.getId()), eq(AuditAction.INVITATION_DISABLED), eq("InvitationLink"), eq(invitationId));
    }
}
