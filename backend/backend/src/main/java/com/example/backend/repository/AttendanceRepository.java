package com.example.backend.repository;

import com.example.backend.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    boolean existsByUserNoAndDate(Long userNo, LocalDate date);
}
