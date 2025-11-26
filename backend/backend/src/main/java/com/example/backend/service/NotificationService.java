package com.example.backend.service;

import com.example.backend.entity.Notification;
import com.example.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repository;

    // ✅ 알림 전송
    public void send(Long receiverUserNo, String message, String link) {
        Notification noti = Notification.builder()
                .receiverUserNo(receiverUserNo)
                .message(message)
                .link(link)
                .isRead(false)
                .createdDate(LocalDateTime.now())
                .build();
        repository.save(noti);
    }

    // ✅ 전체 알림 목록
    public Page<Notification> getNotifications(Long receiverUserNo, Pageable pageable) {
        return repository.findByReceiverUserNoOrderByCreatedDateDesc(receiverUserNo, pageable);
    }


    // ✅ 안 읽은 알림 개수
    public long getUnreadCount(Long receiverUserNo) {
        return repository.countByReceiverUserNoAndIsReadFalse(receiverUserNo);
    }

    // ✅ 알림 읽음 처리
    @Transactional
    public void markAsRead(Long id) {
        repository.findById(id).ifPresent(n -> n.setRead(true));
    }
    //전체읽음처리
    @Transactional
    public void markAllAsRead(Long userNo) {
    List<Notification> list = repository.findByReceiverUserNoAndIsReadFalse(userNo);
    list.forEach(n -> n.setRead(true));
    repository.saveAll(list);
    }

    // 🔥 전체 삭제 정식 버전
    @Transactional
    public void deleteAll(Long userNo) {
        repository.deleteAllByUserNo(userNo);
    }

    // ⭐ 포인트 지급 알림 전용
    public void sendPoint(Long receiverUserNo, int amount) {
        String message = "포인트 " + amount + "점이 지급되었습니다.";
        String link = "/mypage"; // 원하는 링크로 변경 가능

        send(receiverUserNo, message, link);
    }



}
