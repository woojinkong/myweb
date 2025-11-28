package com.example.backend.repository;

import com.example.backend.entity.VisitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface VisitLogRepository extends JpaRepository<VisitLog, Long> {

    List<VisitLog> findByIpAddressAndVisitDateBetween(
            String ip,
            LocalDateTime start,
            LocalDateTime end
    );

    // 특정 날짜 방문자 수
    long countByVisitDateBetween(LocalDateTime  start, LocalDateTime  end);
}
