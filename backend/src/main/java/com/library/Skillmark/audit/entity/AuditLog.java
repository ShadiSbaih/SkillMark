package com.library.Skillmark.audit.entity;

import com.library.Skillmark.audit.entity.*;
import com.library.Skillmark.audit.enums.*;
import com.library.Skillmark.audit.repository.*;
import com.library.Skillmark.audit.service.*;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "actor_user_id")
    private UUID actorUserId;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private AuditAction action;

    @Column(name = "entity_type", length = 100)
    private String entityType;

    @Column(name = "entity_id")
    private UUID entityId;

    @Column(name = "ip_address", length = 100)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String metadata;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() { createdAt = Instant.now(); }

    public UUID getId() { return id; }
    public UUID getActorUserId() { return actorUserId; }
    public UUID getOrganizationId() { return organizationId; }
    public AuditAction getAction() { return action; }
    public String getEntityType() { return entityType; }
    public UUID getEntityId() { return entityId; }
    public String getIpAddress() { return ipAddress; }
    public String getUserAgent() { return userAgent; }
    public String getMetadata() { return metadata; }
    public Instant getCreatedAt() { return createdAt; }
    public void setActorUserId(UUID actorUserId) { this.actorUserId = actorUserId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
    public void setAction(AuditAction action) { this.action = action; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public void setEntityId(UUID entityId) { this.entityId = entityId; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
}
