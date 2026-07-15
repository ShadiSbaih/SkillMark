package com.library.Skillmark.auth.service;

import com.library.Skillmark.auth.dto.*;
import com.library.Skillmark.common.exception.*;
import com.library.Skillmark.email.service.EmailService;
import com.library.Skillmark.membership.entity.OrganizationMembership;
import com.library.Skillmark.membership.enums.MembershipRole;
import com.library.Skillmark.membership.enums.MembershipStatus;
import com.library.Skillmark.membership.repository.OrganizationMembershipRepository;
import com.library.Skillmark.organization.entity.Organization;
import com.library.Skillmark.organization.enums.OrganizationStatus;
import com.library.Skillmark.organization.repository.OrganizationRepository;
import com.library.Skillmark.security.AuthUser;
import com.library.Skillmark.user.dto.UserResponse;
import com.library.Skillmark.user.entity.User;
import com.library.Skillmark.user.enums.UserStatus;
import com.library.Skillmark.user.repository.UserRepository;
import com.library.Skillmark.user.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMembershipRepository membershipRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final VerificationTokenService verificationTokenService;
    private final EmailService emailService;
    private final UserService userService;

    public AuthService(UserRepository userRepository,
                       OrganizationRepository organizationRepository,
                       OrganizationMembershipRepository membershipRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       VerificationTokenService verificationTokenService,
                       EmailService emailService,
                       UserService userService) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.membershipRepository = membershipRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.verificationTokenService = verificationTokenService;
        this.emailService = emailService;
        this.userService = userService;
    }

    @Transactional
    public void register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email is already registered");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setStatus(UserStatus.PENDING_VERIFICATION);

        var token = verificationTokenService.generateEmailVerificationToken();
        user.setEmailVerificationToken(token.value());
        user.setEmailVerificationExpiresAt(token.expiresAt());

        User savedUser = userRepository.save(user);

        if (request.role() == RegisterRequest.Role.OWNER) {
            createOwnerOrganization(savedUser, request.organizationName());
        }

        emailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getName(), token.value());
    }

    @Transactional
    public String login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ForbiddenException("EMAIL_NOT_VERIFIED");
        }

        return jwtService.generateToken(user.getId(), user.getEmail());
    }

    @Transactional
    public String verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByEmailVerificationToken(request.token())
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification token"));

        if (!verificationTokenService.isValid(new VerificationTokenService.Token(user.getEmailVerificationToken(), user.getEmailVerificationExpiresAt()))) {
            throw new BadRequestException("Invalid or expired verification token");
        }

        user.setEmailVerifiedAt(Instant.now());
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiresAt(null);
        user.setStatus(UserStatus.ACTIVE);

        return jwtService.generateToken(user.getId(), user.getEmail());
    }

    @Transactional
    public void resendVerification(ResendVerificationRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim().toLowerCase())
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new BadRequestException("Email is already verified");
        }

        var token = verificationTokenService.generateEmailVerificationToken();
        user.setEmailVerificationToken(token.value());
        user.setEmailVerificationExpiresAt(token.expiresAt());

        emailService.sendVerificationEmail(user.getEmail(), user.getName(), token.value());
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim().toLowerCase())
                .orElseThrow(() -> new NotFoundException("User not found"));

        var token = verificationTokenService.generatePasswordResetToken();
        user.setPasswordResetToken(token.value());
        user.setPasswordResetExpiresAt(token.expiresAt());

        emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), token.value());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.token())
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (!verificationTokenService.isValid(new VerificationTokenService.Token(user.getPasswordResetToken(), user.getPasswordResetExpiresAt()))) {
            throw new BadRequestException("Invalid or expired reset token");
        }

        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
    }

    @Transactional(readOnly = true)
    public AuthUserResponse me(AuthUser currentUser) {
        UserResponse user = userService.me(currentUser.id());
        return AuthUserResponse.from(user);
    }

    private void createOwnerOrganization(User owner, String organizationName) {
        if (!StringUtils.hasText(organizationName)) {
            throw new BadRequestException("Organization name is required");
        }

        Organization organization = new Organization();
        organization.setName(organizationName.trim());
        organization.setOwner(owner);
        organization.setStatus(OrganizationStatus.ACTIVE);
        Organization savedOrg = organizationRepository.save(organization);

        OrganizationMembership membership = new OrganizationMembership();
        membership.setOrganization(savedOrg);
        membership.setUser(owner);
        membership.setRole(MembershipRole.OWNER);
        membership.setStatus(MembershipStatus.ACTIVE);
        membershipRepository.save(membership);
    }
}
