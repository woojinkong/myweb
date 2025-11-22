package com.example.backend.service;

import com.example.backend.entity.Attendance;
import com.example.backend.exception.CustomException;
import com.example.backend.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepo;
    private final PointService pointService;
    private final NotificationService notificationService;

    @Transactional
    public void checkAttendance(Long userNo) {

        LocalDate today = LocalDate.now();

        // ⭐ 이미 오늘 출석했는지 확인
        if (attendanceRepo.existsByUserNoAndDate(userNo, today)) {
            return;
        }

        // ⭐ 출석 기록 저장
        attendanceRepo.save(
                Attendance.builder()
                        .userNo(userNo)
                        .date(today)
                        .build()
        );

        // ⭐ 포인트 20 지급
        pointService.addPoint(userNo, 20, "ATTENDANCE");

        // ⭐ 출석 알림 발송
        notificationService.send(
                userNo,
                "출석 체크 완료! 포인트지급완료!",
                "/mypage/points"
        );
    }
}
