package com.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import com.example.backend.entity.Report;
import com.example.backend.entity.Board;
import com.example.backend.repository.ReportRepository;
import com.example.backend.repository.BoardRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final BoardRepository boardRepository;

    @Transactional
    public Report reportBoard(Long boardNo, String userId, String reason) {
        Board board = boardRepository.findById(boardNo).orElseThrow();

        Report report = Report.builder()
                .board(board)
                .reporterId(userId)
                .reason(reason)
                .build();

        return reportRepository.save(report);
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll(Sort.by(Sort.Direction.DESC, "reportedAt"));
    }

}
