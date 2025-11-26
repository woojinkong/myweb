package com.example.backend.service;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPT = 5;        // 최대 실패 횟수
    private static final int BLOCK_MINUTES = 10;     // 차단 시간

    private final Map<String, Integer> attempts = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> blockUntil = new ConcurrentHashMap<>();

    // 로그인 실패 시 호출
    public void loginFailed(String userId) {
        int count = attempts.getOrDefault(userId, 0) + 1;
        attempts.put(userId, count);

        if (count >= MAX_ATTEMPT) {
            blockUntil.put(userId, LocalDateTime.now().plusMinutes(BLOCK_MINUTES));
        }
    }

    // 로그인 성공 시 초기화
    public void loginSucceeded(String userId) {
        attempts.remove(userId);
        blockUntil.remove(userId);
    }

    // 차단 중인지 확인
    public boolean isBlocked(String userId) {

        LocalDateTime time = blockUntil.get(userId);
        if (time == null) return false;

        // 이미 시간이 지난 경우 차단 해제
        if (LocalDateTime.now().isAfter(time)) {
            attempts.remove(userId);
            blockUntil.remove(userId);
            return false;
        }

        return true;
    }

    // 남은 차단 시간 (분)
    public long remainingMinutes(String userId) {
        if (!blockUntil.containsKey(userId)) return 0;
        return java.time.Duration.between(LocalDateTime.now(), blockUntil.get(userId)).toMinutes();
    }
}
