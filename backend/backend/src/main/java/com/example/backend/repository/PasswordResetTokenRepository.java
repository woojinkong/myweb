package com.example.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.PasswordResetToken;
import com.example.backend.entity.User;

import jakarta.transaction.Transactional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    @Transactional
    void deleteByUser(User user);

    Optional<PasswordResetToken> findByUser(User user);

    
}

