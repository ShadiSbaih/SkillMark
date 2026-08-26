package com.library.Skillmark.certificate.repository;

import com.library.Skillmark.certificate.entity.Certificate;
import com.library.Skillmark.certificate.enums.CertificateStatus;
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
    long countByProgramId(UUID programId);
    Optional<Certificate> findByVerificationCode(String verificationCode);

    default long countByOrganizationId(UUID organizationId) {
        return count();
    }

    @Query("""
            select function('date_trunc', 'day', c.issuedAt),
                   sum(case when c.status = 'ACTIVE' then 1 else 0 end),
                   sum(case when c.status = 'REVOKED' then 1 else 0 end)
            from Certificate c
            where c.issuedAt between :start and :end
            group by function('date_trunc', 'day', c.issuedAt)
            order by function('date_trunc', 'day', c.issuedAt)
            """)
    List<Object[]> dailyCertificateTimeline(Instant start, Instant end);

    @Query("""
            select function('date_trunc', 'week', c.issuedAt),
                   sum(case when c.status = 'ACTIVE' then 1 else 0 end),
                   sum(case when c.status = 'REVOKED' then 1 else 0 end)
            from Certificate c
            where c.issuedAt between :start and :end
            group by function('date_trunc', 'week', c.issuedAt)
            order by function('date_trunc', 'week', c.issuedAt)
            """)
    List<Object[]> weeklyCertificateTimeline(Instant start, Instant end);

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
            where p.deletedAt is null
            group by p.id, p.title
            order by count(distinct e.user.id) desc
            """)
    List<Object[]> topProgramsByEnrollments();

    default List<Object[]> dailyCertificateTimelineForOrganization(UUID organizationId, Instant start, Instant end) {
        return dailyCertificateTimeline(start, end);
    }

    default List<Object[]> weeklyCertificateTimelineForOrganization(UUID organizationId, Instant start, Instant end) {
        return weeklyCertificateTimeline(start, end);
    }

    default List<Object[]> topProgramsByEnrollments(UUID organizationId) {
        return topProgramsByEnrollments();
    }
}
