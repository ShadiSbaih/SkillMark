package com.library.cohive.organization.repository;

import com.library.cohive.organization.entity.OrganizationStudent;
import com.library.cohive.organization.entity.OrganizationStudentId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrganizationStudentRepository extends JpaRepository<OrganizationStudent, OrganizationStudentId> {
    boolean existsByOrganization_IdAndStudent_Id(UUID organizationId, UUID studentId);

    boolean existsByOrganization_Owner_IdAndStudent_Id(UUID ownerId, UUID studentId);

    List<OrganizationStudent> findByOrganization_Id(UUID organizationId);

    List<OrganizationStudent> findByOrganization_IdIn(List<UUID> organizationIds);

    List<OrganizationStudent> findByStudent_Id(UUID studentId);
}
