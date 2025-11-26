package com.example.backend.controller;

import com.example.backend.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check")
    public ResponseEntity<?> check(@RequestBody Map<String, Long> body) {
        Long userNo = body.get("userNo");
        attendanceService.checkAttendance(userNo);
        return ResponseEntity.ok("출석 체크 완료! +20포인트 획득");
    }
}
