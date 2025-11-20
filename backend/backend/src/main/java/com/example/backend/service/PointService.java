package com.example.backend.service;

import com.example.backend.entity.PointHistory;
import com.example.backend.entity.User;
import com.example.backend.repository.PointHistoryRepository;
import com.example.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PointService {

    private final UserRepository userRepository;
    private final PointHistoryRepository historyRepository;
    private final NotificationService notificationService; // ⭐ 추가

    @Transactional
    public void addPoint(Long userNo, int amount, String type) {

        User user = userRepository.findById(userNo)
                .orElseThrow(() -> new RuntimeException("유저 없음"));

        user.setPoint(user.getPoint() + amount);

        // 히스토리 저장
        historyRepository.save(
                PointHistory.builder()
                        .userNo(userNo)
                        .amount(amount)
                        .type(type)
                        .build()
        );

        // 4) ⭐ 포인트 지급 알림 생성
        notificationService.sendPoint(userNo, amount);
    }
}
