package com.library.Skillmark.enrollment.repository;

import com.library.Skillmark.enrollment.entity.ProgramEnrollment;
import com.library.Skillmark.enrollment.enums.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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

    @Query("select count(distinct e.user.id) from ProgramEnrollment e where e.program.organization.id = :organizationId and e.status = :status")
    long countDistinctUsersByOrganizationIdAndStatus(UUID organizationId, EnrollmentStatus status);
}
