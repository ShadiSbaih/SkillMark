package com.library.Skillmark.audit.repository;

import com.library.Skillmark.audit.entity.*;
import com.library.Skillmark.audit.enums.*;
import com.library.Skillmark.audit.repository.*;
import com.library.Skillmark.audit.service.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
}
