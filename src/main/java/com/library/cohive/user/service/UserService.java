package com.library.cohive.user.service;

import com.library.cohive.common.exception.ResourceNotFoundException;
import com.library.cohive.common.util.SecurityUtil;
import com.library.cohive.user.dto.UserResponse;
import com.library.cohive.user.entity.User;
import com.library.cohive.user.mapper.UserMapper;
import com.library.cohive.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserResponse getCurrentUser() {
        return userMapper.toResponse(getCurrentUserEntity());
    }

    public User getCurrentUserEntity() {
        UUID userId = SecurityUtil.getCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
