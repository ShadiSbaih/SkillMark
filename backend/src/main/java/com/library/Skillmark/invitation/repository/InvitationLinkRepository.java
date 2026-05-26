package com.library.Skillmark.invitation.repository;

import com.library.Skillmark.invitation.entity.InvitationLink;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvitationLinkRepository extends JpaRepository<InvitationLink, UUID> {
    Optional<InvitationLink> findByCode(String code);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select invitation from InvitationLink invitation where lower(invitation.code) = lower(:code)")
    Optional<InvitationLink> findByCodeForUpdate(String code);
    boolean existsByCode(String code);
    List<InvitationLink> findByProgramId(UUID programId);
}
