package com.library.Skillmark.user.service;

import com.library.Skillmark.user.controller.*;
import com.library.Skillmark.user.dto.*;
import com.library.Skillmark.user.entity.*;
import com.library.Skillmark.user.enums.*;
import com.library.Skillmark.user.repository.*;
import com.library.Skillmark.user.service.*;
import com.library.Skillmark.common.exception.NotFoundException;
import com.library.Skillmark.security.AuthUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public UserResponse sync(AuthUser currentUser) {
        User user = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new NotFoundException("User not found"));
        return UserResponse.from(user);
    }
}
