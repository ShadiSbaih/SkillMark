package com.library.cohive.user.mapper;

import com.library.cohive.user.dto.UserResponse;
import com.library.cohive.user.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
}
