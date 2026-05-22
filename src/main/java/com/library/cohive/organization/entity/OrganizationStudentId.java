package com.library.cohive.organization.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class OrganizationStudentId implements Serializable {

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;
}
