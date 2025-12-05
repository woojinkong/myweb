package com.example.backend.controller;

import com.example.backend.dto.DailyStatsDTO;
import com.example.backend.dto.MonthlyStatsDTO;
import com.example.backend.dto.WeeklyStatsDTO;
import com.example.backend.service.VisitStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class StatsController {

    private final VisitStatsService visitStatsService;

    @GetMapping("/daily")
    public List<DailyStatsDTO> daily() {
        return visitStatsService.getDailyStats();
    }

    @GetMapping("/weekly")
    public List<WeeklyStatsDTO> weekly() {
        return visitStatsService.getWeeklyStats();
    }

    @GetMapping("/monthly")
    public List<MonthlyStatsDTO> monthly() {
        return visitStatsService.getMonthlyStats();
    }
}
