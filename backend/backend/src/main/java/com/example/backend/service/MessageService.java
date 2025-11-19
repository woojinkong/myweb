package com.example.backend.service;

import com.example.backend.dto.MessageDTO;
import com.example.backend.entity.Message;
import com.example.backend.entity.User;
import com.example.backend.repository.MessageRepository;
import com.example.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepo;
    private final UserRepository userRepo;

    // ✅ 쪽지 보내기
    public void sendMessage(MessageDTO dto) {
        User sender = userRepo.findByUserId(dto.getSenderId())
                .orElseThrow(() -> new RuntimeException("보내는 유저를 찾을 수 없습니다."));
        User receiver = userRepo.findByUserId(dto.getReceiverId())
                .orElseThrow(() -> new RuntimeException("받는 유저를 찾을 수 없습니다."));

        Message msg = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(dto.getContent())
                .read(false)
                .sendDate(LocalDateTime.now())
                .build();

        messageRepo.save(msg);
    }

    // ✅ 받은 쪽지 목록 (receiver 기준)
    public List<MessageDTO> getReceivedMessages(String receiverId) {
        User receiver = userRepo.findByUserId(receiverId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        return messageRepo.findByReceiverOrderBySendDateDesc(receiver)
                .stream()
                .map(msg -> MessageDTO.builder()
                        .messageNo(msg.getMessageNo())
                        .senderId(msg.getSender().getUserId()) // ✅ 아이디 기반
                        .receiverId(receiverId)
                        .content(msg.getContent())
                        .read(msg.isRead())
                        .sendDate(msg.getSendDate())
                        .build())
                .collect(Collectors.toList());
    }

    // ✅ 보낸 쪽지 목록 (sender 기준)
    public List<MessageDTO> getSentMessages(String senderId) {
        User sender = userRepo.findByUserId(senderId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        return messageRepo.findBySenderOrderBySendDateDesc(sender)
                .stream()
                .map(msg -> MessageDTO.builder()
                        .messageNo(msg.getMessageNo())
                        .senderId(senderId)
                        .receiverId(msg.getReceiver().getUserId()) // ✅ 아이디 기반
                        .content(msg.getContent())
                        .read(msg.isRead())
                        .sendDate(msg.getSendDate())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    // ✅ 읽음 처리
    public void markAsRead(Long messageNo) {
        System.out.println("🔥 markAsRead 호출됨! messageNo = " + messageNo);
        Message msg = messageRepo.findById(messageNo)
                .orElseThrow(() -> new RuntimeException("쪽지를 찾을 수 없습니다."));
        msg.setRead(true);
        messageRepo.save(msg);
    }

    // ✅ 삭제
    public void deleteMessage(Long messageNo) {
        messageRepo.deleteById(messageNo);
    }

    // ✅ 읽지 않은 쪽지 개수 조회
public long countUnreadMessages(String receiverId) {
    User receiver = userRepo.findByUserId(receiverId)
            .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
    return messageRepo.countByReceiverAndReadFalse(receiver);
}

}
