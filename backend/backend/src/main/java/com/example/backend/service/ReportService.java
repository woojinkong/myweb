package com.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import com.example.backend.entity.Report;
import com.example.backend.entity.Board;
import com.example.backend.repository.ReportRepository;
import com.example.backend.repository.BoardRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    // ⭐ 새로 추가되는 페이징 조회 메서드
    public Map<String, Object> getReports(int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("reportedAt").descending());
        Page<Report> result = reportRepository.findAll(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("reports", result.getContent());
        response.put("currentPage", result.getNumber());
        response.put("totalPages", result.getTotalPages());
        response.put("totalItems", result.getTotalElements());

        return response;
    }

}


