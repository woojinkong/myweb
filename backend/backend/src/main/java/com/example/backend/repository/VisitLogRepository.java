package com.example.backend.repository;

import com.example.backend.entity.VisitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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

    @Query("""
    SELECT DATE(v.visitDate), COUNT(v)
    FROM VisitLog v
    WHERE v.visitDate >= :start AND v.visitDate <= :end
    GROUP BY DATE(v.visitDate)
    ORDER BY DATE(v.visitDate)
    """)
    List<Object[]> getDailyVisits(LocalDateTime start, LocalDateTime end);

    @Query("""
    SELECT DATE_FORMAT(v.visitDate, '%Y-%m'), COUNT(v)
    FROM VisitLog v
    GROUP BY DATE_FORMAT(v.visitDate, '%Y-%m')
    ORDER BY DATE_FORMAT(v.visitDate, '%Y-%m')
    """)
    List<Object[]> getMonthlyVisits();
}
