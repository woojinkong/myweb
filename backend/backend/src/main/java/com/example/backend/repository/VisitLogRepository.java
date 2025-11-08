package com.example.backend.repository;

import com.example.backend.entity.VisitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.Optional;

public interface VisitLogRepository extends JpaRepository<VisitLog, Long> {

    // 오늘 날짜 기준 특정 IP가 이미 방문했는지 체크
    Optional<VisitLog> findByIpAddressAndVisitDateBetween(String ip, LocalDateTime  start, LocalDateTime  end);

    // 특정 날짜 방문자 수
    long countByVisitDateBetween(LocalDateTime  start, LocalDateTime  end);
}
