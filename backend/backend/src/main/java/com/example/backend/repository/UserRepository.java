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
    @Query("""
    SELECT DATE(u.userCreateDate), COUNT(u)
    FROM User u
    WHERE u.userCreateDate >= :start AND u.userCreateDate <= :end
    GROUP BY DATE(u.userCreateDate)
    ORDER BY DATE(u.userCreateDate)
    """)
    List<Object[]> getDailySignups(LocalDateTime start, LocalDateTime end);

    @Query("""
    SELECT DATE_FORMAT(u.userCreateDate, '%Y-%m'), COUNT(u)
    FROM User u
    GROUP BY DATE_FORMAT(u.userCreateDate, '%Y-%m')
    ORDER BY DATE_FORMAT(u.userCreateDate, '%Y-%m')
    """)
    List<Object[]> getMonthlySignups();



}
