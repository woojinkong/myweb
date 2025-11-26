package com.example.backend.repository;

import com.example.backend.entity.Message;
import com.example.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByReceiverOrderBySendDateDesc(User receiver, Pageable pageable);
    Page<Message> findBySenderOrderBySendDateDesc(User sender, Pageable pageable);


    // ✅ 읽지 않은 쪽지 개수
    long countByReceiverAndReadFalse(User receiver);

    @Query("SELECT m.sendDate FROM Message m WHERE m.sender.userId = :userId ORDER BY m.sendDate DESC")
    List<LocalDateTime> findRecentMessageTimes(@Param("userId") String userId, Pageable pageable);

}
