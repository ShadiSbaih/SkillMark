package com.library.Skillmark.resource.repository;

import com.library.Skillmark.resource.entity.ProgramResource;
import com.library.Skillmark.resource.enums.ResourceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProgramResourceRepository extends JpaRepository<ProgramResource, UUID> {
    List<ProgramResource> findByProgramIdAndStatusOrderByPositionAsc(UUID programId, ResourceStatus status);
    List<ProgramResource> findByProgramIdAndStatusAndVisibleToParticipantsTrueOrderByPositionAsc(UUID programId, ResourceStatus status);
    List<ProgramResource> findByProgramIdOrderByPositionAsc(UUID programId);
    long countByProgramIdAndStatus(UUID programId, ResourceStatus status);
}
