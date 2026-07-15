package com.library.Skillmark.certificate.repository;

import com.library.Skillmark.certificate.controller.*;
import com.library.Skillmark.certificate.dto.*;
import com.library.Skillmark.certificate.entity.*;
import com.library.Skillmark.certificate.enums.*;
import com.library.Skillmark.certificate.repository.*;
import com.library.Skillmark.certificate.service.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CertificateRepository extends JpaRepository<Certificate, UUID> {
    boolean existsByQuizIdAndUserIdAndStatus(UUID quizId, UUID userId, CertificateStatus status);
    boolean existsByCertificateNumber(String certificateNumber);
    boolean existsByVerificationCode(String verificationCode);
    List<Certificate> findByUserId(UUID userId);
    List<Certificate> findByOrganizationId(UUID organizationId);
    long countByOrganizationId(UUID organizationId);
    long countByProgramId(UUID programId);
    Optional<Certificate> findByVerificationCode(String verificationCode);

    @Query("""
            select function('date_trunc', 'day', c.issuedAt),
                   sum(case when c.status = 'ACTIVE' then 1 else 0 end),
                   sum(case when c.status = 'REVOKED' then 1 else 0 end)
            from Certificate c
            where c.organization.id = :organizationId and c.issuedAt between :start and :end
            group by function('date_trunc', 'day', c.issuedAt)
            order by function('date_trunc', 'day', c.issuedAt)
            """)
    List<Object[]> dailyCertificateTimelineForOrganization(UUID organizationId, Instant start, Instant end);

    @Query("""
            select function('date_trunc', 'week', c.issuedAt),
                   sum(case when c.status = 'ACTIVE' then 1 else 0 end),
                   sum(case when c.status = 'REVOKED' then 1 else 0 end)
            from Certificate c
            where c.organization.id = :organizationId and c.issuedAt between :start and :end
            group by function('date_trunc', 'week', c.issuedAt)
            order by function('date_trunc', 'week', c.issuedAt)
            """)
    List<Object[]> weeklyCertificateTimelineForOrganization(UUID organizationId, Instant start, Instant end);

    @Query("""
            select p.id,
                   p.title,
                   count(distinct e.user.id),
                   count(c.id),
                   coalesce(avg(a.scorePercentage), 0),
                   sum(case when a.passed = true then 1 else 0 end)
            from Program p
            left join ProgramEnrollment e on e.program.id = p.id
            left join Quiz q on q.program.id = p.id
            left join QuizAttempt a on a.quiz.id = q.id and a.status = 'SUBMITTED'
            left join Certificate c on c.program.id = p.id and c.status = 'ACTIVE'
            where p.organization.id = :organizationId and p.deletedAt is null
            group by p.id, p.title
            order by count(distinct e.user.id) desc
            """)
    List<Object[]> topProgramsByEnrollments(UUID organizationId);
}
