package com.library.Skillmark.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 128) String password,
        Role role,
        String organizationName
) {
    public enum Role {
        ADMIN,
        STUDENT,
        OWNER,
        MEMBER
    }
}
