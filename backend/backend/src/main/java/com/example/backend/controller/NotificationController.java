package com.example.backend.controller;

import com.example.backend.config.CustomUserDetails;
import com.example.backend.entity.Notification;
import com.example.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications") // ✅ 여기 prefix 추가
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;

    // ✅ 내 알림 목록 조회
    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userNo = userDetails.getUser().getUserNo();
        return ResponseEntity.ok(service.getNotifications(userNo));
    }

    // ✅ 안 읽은 알림 개수
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userNo = userDetails.getUser().getUserNo();
        return ResponseEntity.ok(service.getUnreadCount(userNo));
    }

    // ✅ 알림 읽음 처리
    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        service.markAsRead(id);
        return ResponseEntity.noContent().build(); // ✅ 204 No Content
    }
            // ✅ 전체 읽음 처리
    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
        @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
    Long userNo = userDetails.getUser().getUserNo();
    service.markAllAsRead(userNo);
    return ResponseEntity.noContent().build();
    }

    // ✅ 전체 알림 삭제
    @DeleteMapping("/delete-all")
    public ResponseEntity<Void> deleteAll(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userNo = userDetails.getUser().getUserNo();
        service.deleteAll(userNo);
        return ResponseEntity.noContent().build(); // 204
    }



}
