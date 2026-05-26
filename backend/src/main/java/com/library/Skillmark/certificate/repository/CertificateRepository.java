package com.library.Skillmark.certificate.repository;

import com.library.Skillmark.certificate.controller.*;
import com.library.Skillmark.certificate.dto.*;
import com.library.Skillmark.certificate.entity.*;
import com.library.Skillmark.certificate.enums.*;
import com.library.Skillmark.certificate.repository.*;
import com.library.Skillmark.certificate.service.*;
import org.springframework.data.jpa.repository.JpaRepository;

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
}
