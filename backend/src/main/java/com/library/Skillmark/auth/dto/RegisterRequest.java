package com.library.Skillmark.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 128) String password,
        @NotNull Role role,
        String organizationName,
        String inviteCode
) {
    public enum Role {
        OWNER,
        MEMBER
    }
}
