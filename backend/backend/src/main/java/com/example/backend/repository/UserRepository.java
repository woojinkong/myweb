package com.example.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.Query;


public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUserId(String userId);
    boolean existsByUserId(String userId);
    Optional<User> findByUserIdAndUserNameAndEmail(String userId, String userName, String email);
    // UserRepository.java
    long countByUserCreateDateAfter(LocalDateTime date);
    boolean existsByEmail(String email);   // ← 추가
    boolean existsByNickName(String nickName);
}
