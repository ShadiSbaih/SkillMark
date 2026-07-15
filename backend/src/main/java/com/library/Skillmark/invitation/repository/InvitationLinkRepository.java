package com.library.Skillmark.invitation.repository;

import com.library.Skillmark.invitation.entity.InvitationLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvitationLinkRepository extends JpaRepository<InvitationLink, UUID> {
    Optional<InvitationLink> findByCode(String code);
    boolean existsByCode(String code);
    List<InvitationLink> findByProgramId(UUID programId);
}
