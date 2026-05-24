package com.library.Skillmark.auth.service;

import com.library.Skillmark.auth.dto.AuthResponse;
import com.library.Skillmark.auth.dto.LoginRequest;
import com.library.Skillmark.auth.dto.RegisterRequest;
import com.library.Skillmark.common.exception.ConflictException;
import com.library.Skillmark.common.exception.UnauthorizedException;
import com.library.Skillmark.security.jwt.JwtService;
import com.library.Skillmark.student.entity.Student;
import com.library.Skillmark.student.repository.StudentRepository;
import com.library.Skillmark.user.entity.Role;
import com.library.Skillmark.user.entity.User;
import com.library.Skillmark.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already in use");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.STUDENT;
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();
        User savedUser = userRepository.save(user);

        if (role == Role.STUDENT) {
            Student student = Student.builder()
                    .user(savedUser)
                    .build();
            studentRepository.save(student);
        }

        String token = jwtService.generateToken(savedUser);
        return AuthResponse.builder().token(token).build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        String token = jwtService.generateToken(user);
        return AuthResponse.builder().token(token).build();
    }
}
