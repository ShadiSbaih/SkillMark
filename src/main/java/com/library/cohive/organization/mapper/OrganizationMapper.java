package com.library.cohive.organization.mapper;

import com.library.cohive.organization.dto.OrganizationResponse;
import com.library.cohive.organization.entity.Organization;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrganizationMapper {
    @Mapping(source = "owner.id", target = "ownerId")
    OrganizationResponse toResponse(Organization organization);
}
