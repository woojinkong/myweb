package com.example.backend.service;

import com.example.backend.entity.VisitLog;
import com.example.backend.repository.VisitLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class VisitService {

    private final VisitLogRepository visitLogRepository;

    // ✅ IP별 하루 한 번만 기록
    public void recordVisit(HttpServletRequest request) {
        String ip = getClientIp(request);
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        boolean alreadyVisited =
                !visitLogRepository.findByIpAddressAndVisitDateBetween(ip, startOfDay, endOfDay).isEmpty();


        if (!alreadyVisited) {
            VisitLog log = VisitLog.builder()
                    .ipAddress(ip)
                    .visitDate(LocalDateTime.now())
                    .build();
            visitLogRepository.save(log);
        }
    }

    // ✅ 오늘 방문자 수 카운트
    public long countTodayVisits() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        return visitLogRepository.countByVisitDateBetween(start, end);
    }

    // ✅ IP 추출
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
