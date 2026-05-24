package com.library.Skillmark.security.clerk;

import com.library.Skillmark.security.AuthUser;
import com.library.Skillmark.user.entity.User;
import com.library.Skillmark.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClerkUserSyncService {
    private final UserRepository userRepository;

    public ClerkUserSyncService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public AuthUser resolve(String token) {
        DevClerkClaims claims = parseDevToken(token);
        User user = userRepository.findByClerkUserId(claims.clerkUserId())
                .orElseGet(() -> {
                    User created = new User();
                    created.setClerkUserId(claims.clerkUserId());
                    created.setEmail(claims.email());
                    created.setName(claims.name());
                    return userRepository.save(created);
                });
        return new AuthUser(user.getId(), user.getClerkUserId(), user.getEmail());
    }

    private DevClerkClaims parseDevToken(String token) {
        if (!token.startsWith("dev:")) {
            throw new IllegalArgumentException("Only dev Clerk tokens are configured locally");
        }
        String[] parts = token.split(":", 4);
        String clerkUserId = parts.length > 1 && !parts[1].isBlank() ? parts[1] : "clerk_dev_user";
        String email = parts.length > 2 && !parts[2].isBlank() ? parts[2] : clerkUserId + "@example.com";
        String name = parts.length > 3 && !parts[3].isBlank() ? parts[3].replace('_', ' ') : "Skillmark User";
        return new DevClerkClaims(clerkUserId, email, name);
    }

    private record DevClerkClaims(String clerkUserId, String email, String name) {
    }
}
