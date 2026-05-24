package com.library.Skillmark.organization.repository;

import com.library.Skillmark.organization.controller.*;
import com.library.Skillmark.organization.dto.*;
import com.library.Skillmark.organization.entity.*;
import com.library.Skillmark.organization.enums.*;
import com.library.Skillmark.organization.repository.*;
import com.library.Skillmark.organization.service.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {
}
