package com.library.Skillmark.certificate.service;

import com.library.Skillmark.certificate.controller.*;
import com.library.Skillmark.certificate.dto.*;
import com.library.Skillmark.certificate.entity.*;
import com.library.Skillmark.certificate.enums.*;
import com.library.Skillmark.certificate.repository.*;
import com.library.Skillmark.certificate.service.*;
import com.library.Skillmark.attempt.enums.AttemptStatus;
import com.library.Skillmark.attempt.entity.QuizAttempt;
import com.library.Skillmark.attempt.repository.QuizAttemptRepository;
import com.library.Skillmark.audit.enums.AuditAction;
import com.library.Skillmark.audit.service.AuditLogService;
import com.library.Skillmark.common.exception.BusinessRuleException;
import com.library.Skillmark.common.exception.ConflictException;
import com.library.Skillmark.common.exception.NotFoundException;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.common.util.TokenGenerator;
import com.library.Skillmark.quiz.enums.CertificateIssueMode;
import com.library.Skillmark.quiz.entity.Quiz;
import com.library.Skillmark.quiz.repository.QuizRepository;
import com.library.Skillmark.membership.enums.MembershipRole;
import com.library.Skillmark.membership.enums.MembershipStatus;
import com.library.Skillmark.membership.repository.OrganizationMembershipRepository;
import com.library.Skillmark.security.service.AuthorizationService;
import com.library.Skillmark.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import java.time.Instant;
import java.time.Year;
import java.util.Comparator;
import java.util.Optional;
import java.util.UUID;

@Service
public class CertificateService {
    private final CertificateRepository certificateRepository;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final QuizAttemptRepository attemptRepository;
    private final AuthorizationService authorizationService;
    private final AuditLogService auditLogService;
    private final OrganizationMembershipRepository membershipRepository;

    public CertificateService(CertificateRepository certificateRepository,
                              QuizRepository quizRepository,
                              UserRepository userRepository,
                              QuizAttemptRepository attemptRepository,
                              AuthorizationService authorizationService,
                              AuditLogService auditLogService,
                              OrganizationMembershipRepository membershipRepository) {
        this.certificateRepository = certificateRepository;
        this.quizRepository = quizRepository;
        this.userRepository = userRepository;
        this.attemptRepository = attemptRepository;
        this.authorizationService = authorizationService;
        this.auditLogService = auditLogService;
        this.membershipRepository = membershipRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Optional<Certificate> issueAutomaticallyIfEligible(QuizAttempt attempt) {
        Quiz quiz = attempt.getQuiz();
        if (!Boolean.TRUE.equals(attempt.getPassed()) || quiz.getCertificateIssueMode() != CertificateIssueMode.AUTO) {
            return Optional.empty();
        }
        if (certificateRepository.existsByQuizIdAndUserIdAndStatus(quiz.getId(), attempt.getUser().getId(), CertificateStatus.ACTIVE)) {
            return Optional.empty();
        }
        authorizationService.ensureProgramEnrollment(quiz.getProgram().getId(), attempt.getUser().getId());
        Certificate certificate = createCertificate(quiz, attempt.getUser(), attempt,
                quiz.getTitle() + " Certificate");
        auditLogService.record(attempt.getUser().getId(), quiz.getProgram().getOrganization().getId(), AuditAction.CERTIFICATE_ISSUED,
                "Certificate", certificate.getId());
        return Optional.of(certificate);
    }

    @Transactional
    public CertificateResponse issue(IssueCertificateRequest request, UUID actorId) {
        Quiz quiz = quizRepository.findById(request.quizId()).orElseThrow(() -> new NotFoundException("Quiz not found"));
        authorizationService.ensureOrganizationOwner(quiz.getProgram().getOrganization().getId(), actorId);
        if (quiz.getCertificateIssueMode() != CertificateIssueMode.MANUAL) {
            throw new BusinessRuleException("Manual certificate issuing is available only for MANUAL certificate quizzes");
        }
        var user = userRepository.findById(request.userId()).orElseThrow(() -> new NotFoundException("User not found"));
        QuizAttempt attempt = attemptRepository.findById(request.attemptId()).orElseThrow(() -> new NotFoundException("Attempt not found"));
        validateEligibility(quiz, user.getId(), attempt);
        Certificate certificate = createCertificate(quiz, user, attempt,
                request.title() == null || request.title().isBlank() ? quiz.getTitle() + " Certificate" : request.title().trim());
        auditLogService.record(actorId, quiz.getProgram().getOrganization().getId(), AuditAction.CERTIFICATE_ISSUED, "Certificate", certificate.getId());
        return CertificateResponse.from(certificate);
    }

    @Transactional
    public CertificateResponse issueForAttempt(UUID attemptId, IssueCertificateForAttemptRequest request, UUID actorId) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new NotFoundException("Attempt not found"));
        Quiz quiz = attempt.getQuiz();
        authorizationService.ensureOrganizationOwner(quiz.getProgram().getOrganization().getId(), actorId);
        if (quiz.getCertificateIssueMode() != CertificateIssueMode.MANUAL) {
            throw new BusinessRuleException("Manual certificate issuing is available only for MANUAL certificate quizzes");
        }
        validateEligibility(quiz, attempt.getUser().getId(), attempt);
        String title = request == null || request.title() == null || request.title().isBlank()
                ? quiz.getTitle() + " Certificate"
                : request.title().trim();
        Certificate certificate = createCertificate(quiz, attempt.getUser(), attempt, title);
        auditLogService.record(actorId, quiz.getProgram().getOrganization().getId(), AuditAction.CERTIFICATE_ISSUED, "Certificate", certificate.getId());
        return CertificateResponse.from(certificate);
    }

    @Transactional(readOnly = true)
    public PageResponse<CertificateResponse> mine(UUID userId, int page, int size) {
        return PageResponse.fromList(certificateRepository.findByUserId(userId).stream()
                .sorted(Comparator.comparing(Certificate::getIssuedAt).reversed())
                .map(CertificateResponse::from)
                .toList(), page, size);
    }

    @Transactional(readOnly = true)
    public PageResponse<CertificateResponse> organizationCertificates(UUID organizationId, UUID actorId, int page, int size) {
        authorizationService.ensureOrganizationOwner(organizationId, actorId);
        return PageResponse.fromList(certificateRepository.findByOrganizationId(organizationId).stream()
                .sorted(Comparator.comparing(Certificate::getIssuedAt).reversed())
                .map(CertificateResponse::from)
                .toList(), page, size);
    }

    @Transactional(readOnly = true)
    public CertificateResponse get(UUID certificateId, UUID actorId) {
        return CertificateResponse.from(authorizationService.ensureCertificateAccessible(certificateId, actorId));
    }

    @Transactional
    public CertificateResponse revoke(UUID certificateId, String reason, UUID actorId) {
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new NotFoundException("Certificate not found"));
        authorizationService.ensureOrganizationOwner(certificate.getOrganization().getId(), actorId);
        if (certificate.getStatus() == CertificateStatus.REVOKED) {
            throw new ConflictException("Certificate is already revoked");
        }
        certificate.setStatus(CertificateStatus.REVOKED);
        certificate.setRevokedAt(Instant.now());
        certificate.setRevokeReason(reason);
        auditLogService.record(actorId, certificate.getOrganization().getId(), AuditAction.CERTIFICATE_REVOKED,
                "Certificate", certificateId);
        return CertificateResponse.from(certificate);
    }

    @Transactional(readOnly = true)
    public PublicCertificateVerificationResponse verify(String verificationCode) {
        Certificate certificate = certificateRepository.findByVerificationCode(verificationCode)
                .orElseThrow(() -> new NotFoundException("Certificate not found"));
        return PublicCertificateVerificationResponse.from(certificate);
    }

    private void validateEligibility(Quiz quiz, UUID userId, QuizAttempt attempt) {
        authorizationService.ensureProgramEnrollment(quiz.getProgram().getId(), userId);
        if (!attempt.getUser().getId().equals(userId) || !attempt.getQuiz().getId().equals(quiz.getId())) {
            throw new BusinessRuleException("Attempt does not belong to the target user and quiz");
        }
        if (attempt.getStatus() != AttemptStatus.SUBMITTED || !Boolean.TRUE.equals(attempt.getPassed())) {
            throw new BusinessRuleException("Certificate requires a submitted passing attempt");
        }
        if (certificateRepository.existsByQuizIdAndUserIdAndStatus(quiz.getId(), userId, CertificateStatus.ACTIVE)) {
            throw new ConflictException("Active certificate already exists for this user and quiz");
        }
    }

    private Certificate createCertificate(Quiz quiz, com.library.Skillmark.user.entity.User user, QuizAttempt attempt, String title) {
        Certificate certificate = new Certificate();
        certificate.setCertificateNumber(nextCertificateNumber());
        certificate.setVerificationCode(nextVerificationCode());
        certificate.setOrganization(quiz.getProgram().getOrganization());
        certificate.setProgram(quiz.getProgram());
        certificate.setQuiz(quiz);
        certificate.setUser(user);
        certificate.setAttempt(attempt);
        certificate.setTitle(title);
        certificate.setParticipantNameSnapshot(user.getName());
        certificate.setQuizTitleSnapshot(quiz.getTitle());
        certificate.setProgramTitleSnapshot(quiz.getProgram().getTitle());
        certificate.setOrganizationNameSnapshot(quiz.getProgram().getOrganization().getName());
        // Snapshot the first active owner's name
        String ownerName = membershipRepository
                .findByOrganizationIdAndRoleAndStatus(
                        quiz.getProgram().getOrganization().getId(),
                        MembershipRole.OWNER,
                        MembershipStatus.ACTIVE)
                .stream().findFirst()
                .map(m -> m.getUser().getName())
                .orElse(null);
        certificate.setOwnerNameSnapshot(ownerName);
        return certificateRepository.save(certificate);
    }

    private String nextCertificateNumber() {
        return "CERT-" + Year.now().getValue() + "-" + TokenGenerator.randomUppercase(8);
    }

    private String nextVerificationCode() {
        return TokenGenerator.randomUppercase(16);
    }
}
