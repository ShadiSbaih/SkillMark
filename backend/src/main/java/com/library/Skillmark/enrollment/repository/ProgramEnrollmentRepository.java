package com.library.Skillmark.enrollment.repository;

import com.library.Skillmark.enrollment.entity.ProgramEnrollment;
import com.library.Skillmark.enrollment.enums.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProgramEnrollmentRepository extends JpaRepository<ProgramEnrollment, UUID> {
    boolean existsByProgramIdAndUserIdAndStatus(UUID programId, UUID userId, EnrollmentStatus status);
    Optional<ProgramEnrollment> findByProgramIdAndUserIdAndStatus(UUID programId, UUID userId, EnrollmentStatus status);
    List<ProgramEnrollment> findByProgramIdAndStatus(UUID programId, EnrollmentStatus status);
    List<ProgramEnrollment> findByUserIdAndStatus(UUID userId, EnrollmentStatus status);
    long countByProgramId(UUID programId);
    long countByProgramIdAndStatus(UUID programId, EnrollmentStatus status);

    @Query("select count(distinct e.user.id) from ProgramEnrollment e where e.status = :status")
    long countDistinctUsersByStatus(EnrollmentStatus status);

    default long countDistinctUsersByOrganizationIdAndStatus(UUID organizationId, EnrollmentStatus status) {
        return countDistinctUsersByStatus(status);
    }

    @Query("""
            select function('date_trunc', 'day', e.enrolledAt),
                   count(e.id),
                   sum(case when e.status = 'ACTIVE' then 1 else 0 end),
                   sum(case when e.completedAt is not null then 1 else 0 end)
            from ProgramEnrollment e
            where e.program.id = :programId and e.enrolledAt between :start and :end
            group by function('date_trunc', 'day', e.enrolledAt)
            order by function('date_trunc', 'day', e.enrolledAt)
            """)
    List<Object[]> dailyEnrollmentTimelineForProgram(UUID programId, Instant start, Instant end);

    @Query("""
            select function('date_trunc', 'week', e.enrolledAt),
                   count(e.id),
                   sum(case when e.status = 'ACTIVE' then 1 else 0 end),
                   sum(case when e.completedAt is not null then 1 else 0 end)
            from ProgramEnrollment e
            where e.program.id = :programId and e.enrolledAt between :start and :end
            group by function('date_trunc', 'week', e.enrolledAt)
            order by function('date_trunc', 'week', e.enrolledAt)
            """)
    List<Object[]> weeklyEnrollmentTimelineForProgram(UUID programId, Instant start, Instant end);

    @Query("select count(e) from ProgramEnrollment e where e.program.id = :programId and e.completedAt is not null")
    long countCompletedByProgramId(UUID programId);
}
