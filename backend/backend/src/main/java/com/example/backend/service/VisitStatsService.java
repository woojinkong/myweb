package com.example.backend.service;

import com.example.backend.dto.DailyStatsDTO;
import com.example.backend.dto.MonthlyStatsDTO;
import com.example.backend.dto.WeeklyStatsDTO;
import com.example.backend.repository.VisitLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VisitStatsService {

    private final VisitLogRepository visitLogRepository;

    public List<DailyStatsDTO> getDailyStats() {
        List<Object[]> rows = visitLogRepository.countDaily();

        return rows.stream()
                .map(r -> new DailyStatsDTO(
                        r[0].toString(),   // 날짜 문자열
                        ((Number) r[1]).longValue()
                ))
                .toList();
    }

    public List<WeeklyStatsDTO> getWeeklyStats() {
        List<Object[]> rows = visitLogRepository.countWeekly();

        return rows.stream()
                .map(r -> new WeeklyStatsDTO(
                        ((Number) r[0]).intValue(),  // year
                        ((Number) r[1]).intValue(),  // week
                        ((Number) r[2]).longValue()  // count
                ))
                .toList();
    }

    public List<MonthlyStatsDTO> getMonthlyStats() {
        List<Object[]> rows = visitLogRepository.countMonthly();

        return rows.stream()
                .map(r -> new MonthlyStatsDTO(
                        ((Number) r[0]).intValue(),  // year
                        ((Number) r[1]).intValue(),  // month
                        ((Number) r[2]).longValue()
                ))
                .toList();
    }
}

