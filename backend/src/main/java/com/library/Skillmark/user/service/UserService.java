package com.library.Skillmark.user.service;

import com.library.Skillmark.user.controller.*;
import com.library.Skillmark.user.dto.*;
import com.library.Skillmark.user.entity.*;
import com.library.Skillmark.user.enums.*;
import com.library.Skillmark.user.repository.*;
import com.library.Skillmark.user.service.*;
import com.library.Skillmark.common.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse me(UUID userId) {
        return UserResponse.from(userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found")));
    }

    @Transactional
    public UserResponse update(UUID userId, UpdateUserProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        if (request != null) {
            if (StringUtils.hasText(request.name())) {
                user.setName(request.name().trim());
            }
            if (StringUtils.hasText(request.email())) {
                user.setEmail(request.email().trim());
            }
            if (request.avatarUrl() != null) {
                user.setAvatarUrl(request.avatarUrl());
            }
        }
        return UserResponse.from(user);
    }
}
