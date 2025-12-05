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
    SELECT 
         DATE(v.visitDate) AS day,
         COUNT(v) AS count
    FROM VisitLog v
    GROUP BY DATE(v.visitDate)
    ORDER BY DATE(v.visitDate)
            """)
    List<Object[]> countDaily();

    @Query("""
    SELECT 
        YEAR(v.visitDate) AS year,
        WEEK(v.visitDate) AS week,
        COUNT(v) AS count
    FROM VisitLog v
    GROUP BY YEAR(v.visitDate), WEEK(v.visitDate)
    ORDER BY YEAR(v.visitDate), WEEK(v.visitDate)
    """)
    List<Object[]> countWeekly();



    @Query("""
    SELECT 
        YEAR(v.visitDate) AS year,
        MONTH(v.visitDate) AS month,
        COUNT(v) AS count
    FROM VisitLog v
    GROUP BY YEAR(v.visitDate), MONTH(v.visitDate)
    ORDER BY YEAR(v.visitDate), MONTH(v.visitDate)
    """)
    List<Object[]> countMonthly();


}
