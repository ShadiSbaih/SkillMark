package com.library.Skillmark.program.repository;

import com.library.Skillmark.program.entity.Program;
import com.library.Skillmark.program.enums.ProgramStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProgramRepository extends JpaRepository<Program, UUID> {
    List<Program> findByDeletedAtIsNull();
    List<Program> findByStatusAndDeletedAtIsNull(ProgramStatus status);
    long countByDeletedAtIsNull();
}
