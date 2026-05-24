package com.library.cohive.organization.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(name = "AddOrganizationStudentRequest", description = "Associates an existing student profile with an organization.")
public class AddOrganizationStudentRequest {
    @NotNull
    @Schema(description = "Student identifier to add to the organization.", format = "uuid")
    private UUID studentId;
}
