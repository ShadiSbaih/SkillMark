package com.library.cohive.certificate.repository;

import com.library.cohive.certificate.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CertificateRepository extends JpaRepository<Certificate, UUID> {
    boolean existsByCourse_IdAndStudent_Id(UUID courseId, UUID studentId);

    List<Certificate> findByStudent_Id(UUID studentId);
}
