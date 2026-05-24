package com.library.Skillmark.stats.service;

import com.library.Skillmark.certificate.repository.CertificateRepository;
import com.library.Skillmark.enrollment.enums.EnrollmentStatus;
import com.library.Skillmark.enrollment.repository.ProgramEnrollmentRepository;
import com.library.Skillmark.membership.enums.MembershipStatus;
import com.library.Skillmark.membership.repository.OrganizationMembershipRepository;
import com.library.Skillmark.program.enums.ProgramStatus;
import com.library.Skillmark.program.repository.ProgramRepository;
import com.library.Skillmark.resource.enums.ResourceStatus;
import com.library.Skillmark.resource.repository.ProgramResourceRepository;
import com.library.Skillmark.security.service.AuthorizationService;
import com.library.Skillmark.stats.dto.OrganizationStatsResponse;
import com.library.Skillmark.stats.dto.ProgramStatsResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class StatsService {
    private final ProgramRepository programRepository;
    private final OrganizationMembershipRepository membershipRepository;
    private final CertificateRepository certificateRepository;
    private final ProgramEnrollmentRepository enrollmentRepository;
    private final ProgramResourceRepository resourceRepository;
    private final AuthorizationService authorizationService;

    public StatsService(ProgramRepository programRepository,
                        OrganizationMembershipRepository membershipRepository,
                        CertificateRepository certificateRepository,
                        ProgramEnrollmentRepository enrollmentRepository,
                        ProgramResourceRepository resourceRepository,
                        AuthorizationService authorizationService) {
        this.programRepository = programRepository;
        this.membershipRepository = membershipRepository;
        this.certificateRepository = certificateRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.resourceRepository = resourceRepository;
        this.authorizationService = authorizationService;
    }

    @Transactional(readOnly = true)
    public OrganizationStatsResponse organizationStats(UUID organizationId, UUID actorId) {
        authorizationService.ensureOrganizationOwner(organizationId, actorId);
        return new OrganizationStatsResponse(
                programRepository.countByOrganizationIdAndStatusNot(organizationId, ProgramStatus.DELETED),
                membershipRepository.countByOrganizationIdAndStatus(organizationId, MembershipStatus.ACTIVE),
                certificateRepository.findByOrganizationId(organizationId).size()
        );
    }

    @Transactional(readOnly = true)
    public ProgramStatsResponse programStats(UUID programId, UUID actorId) {
        authorizationService.ensureProgramOwner(programId, actorId);
        return new ProgramStatsResponse(
                enrollmentRepository.countByProgramIdAndStatus(programId, EnrollmentStatus.ACTIVE),
                resourceRepository.countByProgramIdAndStatus(programId, ResourceStatus.ACTIVE)
        );
    }
}
