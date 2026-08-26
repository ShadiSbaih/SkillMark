package com.library.Skillmark.user.repository;

import com.library.Skillmark.user.entity.User;
import com.library.Skillmark.user.enums.UserStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldFindUserByEmailVerificationToken() {
        User user = new User();
        user.setName("Test User");
        user.setEmail("test-" + UUID.randomUUID() + "@example.com");
        user.setStatus(UserStatus.PENDING_VERIFICATION);
        user.setEmailVerificationToken("verify-token-" + UUID.randomUUID());
        user.setEmailVerificationExpiresAt(Instant.now().plusSeconds(3600));
        userRepository.save(user);

        var found = userRepository.findByEmailVerificationToken(user.getEmailVerificationToken());

        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo(user.getEmail());
    }

    @Test
    void shouldFindUserByPasswordResetToken() {
        User user = new User();
        user.setName("Reset User");
        user.setEmail("reset-" + UUID.randomUUID() + "@example.com");
        user.setPasswordResetToken("reset-token-" + UUID.randomUUID());
        user.setPasswordResetExpiresAt(Instant.now().plusSeconds(3600));
        userRepository.save(user);

        var found = userRepository.findByPasswordResetToken(user.getPasswordResetToken());

        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo(user.getEmail());
    }
}
