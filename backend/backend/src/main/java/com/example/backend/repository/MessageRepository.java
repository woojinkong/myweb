package com.example.backend.repository;

import com.example.backend.entity.Message;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByReceiverOrderBySendDateDesc(User receiver);
    List<Message> findBySenderOrderBySendDateDesc(User sender);

     // ✅ 읽지 않은 쪽지 개수
    long countByReceiverAndIsReadFalse(User receiver);

    
}
