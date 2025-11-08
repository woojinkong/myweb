package com.example.backend.repository;

import com.example.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByReceiverUserNoOrderByCreatedDateDesc(Long receiverUserNo);
    long countByReceiverUserNoAndIsReadFalse(Long receiverUserNo);
    List<Notification> findByReceiverUserNoAndIsReadFalse(Long userNo);

}
