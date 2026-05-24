package com.library.cohive.student.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
@Schema(name = "CreateStudentRequest", description = "Creates a student user account and profile inside an organization.")
public class CreateStudentRequest {
    @NotBlank
    @Schema(description = "Student full name.", example = "Jane Doe")
    private String name;

    @Email
    @NotBlank
    @Schema(description = "Unique student email address.", example = "jane@example.com")
    private String email;

    @NotBlank
    @Size(min = 6)
    @Schema(description = "Initial password for the student account.", example = "password123", minLength = 6)
    private String password;

    @NotNull
    @Schema(description = "Organization identifier that will own the student membership.", format = "uuid")
    private UUID organizationId;
}
