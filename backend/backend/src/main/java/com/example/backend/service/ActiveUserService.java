package com.example.backend.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ActiveUserService {

    private final Map<String, Long> activeUsers = new ConcurrentHashMap<>();
    private static final long ACTIVE_TIMEOUT = 5 * 60 * 1000; // 5분

    // 유저 활동 업데이트
    public void updateActivity(String userId) {
        activeUsers.put(userId, Instant.now().toEpochMilli());
    }

    // 현재 접속자 수 계산
    public long getActiveUserCount() {
        long now = Instant.now().toEpochMilli();
        return activeUsers.values().stream()
                .filter(ts -> now - ts < ACTIVE_TIMEOUT)
                .count();
    }
}
