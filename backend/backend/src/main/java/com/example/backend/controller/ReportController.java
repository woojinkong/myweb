package com.example.backend.controller;

import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.ReportRequest;
import com.example.backend.entity.Report;
import com.example.backend.service.ReportService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/board/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/{boardNo}")
    public ResponseEntity<?> reportBoard(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long boardNo,
            @RequestBody ReportRequest request
    ) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Report saved = reportService.reportBoard(
                boardNo,
                userDetails.getUser().getUserId(),
                request.getReason()
        );

        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Report>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

}
