package com.library.Skillmark.membership.repository;

import com.library.Skillmark.membership.controller.*;
import com.library.Skillmark.membership.dto.*;
import com.library.Skillmark.membership.entity.*;
import com.library.Skillmark.membership.enums.*;
import com.library.Skillmark.membership.repository.*;
import com.library.Skillmark.membership.service.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrganizationMembershipRepository extends JpaRepository<OrganizationMembership, UUID> {
    Optional<OrganizationMembership> findByOrganizationIdAndUserIdAndStatus(UUID organizationId, UUID userId, MembershipStatus status);
    Optional<OrganizationMembership> findByOrganizationIdAndUserId(UUID organizationId, UUID userId);
    List<OrganizationMembership> findByOrganizationId(UUID organizationId);
    List<OrganizationMembership> findByUserIdAndStatus(UUID userId, MembershipStatus status);
    long countByOrganizationIdAndStatus(UUID organizationId, MembershipStatus status);
    boolean existsByOrganizationIdAndUserIdAndRoleAndStatus(UUID organizationId, UUID userId, MembershipRole role, MembershipStatus status);
    boolean existsByOrganizationIdAndUserIdAndStatus(UUID organizationId, UUID userId, MembershipStatus status);
    List<OrganizationMembership> findByOrganizationIdAndRoleAndStatus(UUID organizationId, MembershipRole role, MembershipStatus status);
}
