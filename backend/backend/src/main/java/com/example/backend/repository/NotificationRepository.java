package com.example.backend.repository;

import com.example.backend.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByReceiverUserNoOrderByCreatedDateDesc(Long receiverUserNo, Pageable pageable);


    long countByReceiverUserNoAndIsReadFalse(Long receiverUserNo);

    List<Notification> findByReceiverUserNoAndIsReadFalse(Long userNo);

    // 🔥 전체 삭제 JPQL (완전 안전)
    @Modifying
    @Query("delete from Notification n where n.receiverUserNo = :userNo")
    void deleteAllByUserNo(@Param("userNo") Long userNo);


}
