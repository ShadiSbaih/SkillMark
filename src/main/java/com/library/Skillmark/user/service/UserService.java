package com.library.Skillmark.user.service;

import com.library.Skillmark.common.exception.ResourceNotFoundException;
import com.library.Skillmark.common.util.SecurityUtil;
import com.library.Skillmark.user.dto.UserResponse;
import com.library.Skillmark.user.entity.User;
import com.library.Skillmark.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserResponse getCurrentUser() {
        return UserResponse.fromEntity(getCurrentUserEntity());
    }

    public User getCurrentUserEntity() {
        UUID userId = SecurityUtil.getCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
