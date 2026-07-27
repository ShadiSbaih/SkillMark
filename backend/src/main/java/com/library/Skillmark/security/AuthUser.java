package com.library.Skillmark.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import com.library.Skillmark.user.enums.UserRole;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public record AuthUser(UUID id, String email, UserRole role) implements UserDetails {
    public AuthUser(UUID id, String email) {
        this(id, email, UserRole.STUDENT);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (role == null) {
            return List.of();
        }
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return "";
    }
}
