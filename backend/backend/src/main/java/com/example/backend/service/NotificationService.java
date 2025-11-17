package com.example.backend.service;

import com.example.backend.entity.Notification;
import com.example.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
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
    public List<Notification> getNotifications(Long receiverUserNo) {
        return repository.findByReceiverUserNoOrderByCreatedDateDesc(receiverUserNo);
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


}
