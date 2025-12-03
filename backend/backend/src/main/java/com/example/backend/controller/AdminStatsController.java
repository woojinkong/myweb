package com.example.backend.controller;

import com.example.backend.repository.UserRepository;
import com.example.backend.repository.VisitLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/admin/stats")
@RequiredArgsConstructor
public class AdminStatsController {

    private final UserRepository userRepository;
    private final VisitLogRepository visitLogRepository;

    // 🔹 최근 30일 통계
    @GetMapping("/daily")
    public ResponseEntity<?> getDailyStats() {

        LocalDateTime start = LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(23, 59, 59);

        var dailyVisits = visitLogRepository.getDailyVisits(start, end);
        var dailySignups = userRepository.getDailySignups(start, end);

        return ResponseEntity.ok(
                Map.of(
                        "visits", dailyVisits,
                        "signups", dailySignups
                )
        );
    }

    // 🔹 월별 전체 통계
    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyStats() {

        var monthlyVisits = visitLogRepository.getMonthlyVisits();
        var monthlySignups = userRepository.getMonthlySignups();

        return ResponseEntity.ok(
                Map.of(
                        "visits", monthlyVisits,
                        "signups", monthlySignups
                )
        );
    }
}


