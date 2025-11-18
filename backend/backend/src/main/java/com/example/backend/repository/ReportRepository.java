package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend.entity.Report;
import com.example.backend.entity.Board;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByBoard(Board board);
    void deleteByBoard_BoardNo(Long boardNo);
}
