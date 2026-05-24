package com.library.Skillmark.organization.dto;

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
@Schema(description = "Request body for adding an existing student to an organization.")
public class AddOrganizationStudentRequest {
    @NotNull
    @Schema(description = "Student to add to the organization.", format = "uuid")
    private UUID studentId;
}
