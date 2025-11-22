package com.example.backend.service;

import com.example.backend.dto.MessageDTO;
import com.example.backend.entity.Message;
import com.example.backend.entity.User;
import com.example.backend.exception.CustomException;
import com.example.backend.repository.MessageRepository;
import com.example.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepo;
    private final UserRepository userRepo;
    private final PointService pointService;

    // ✅ 쪽지 보내기
    @Transactional
    public void sendMessage(MessageDTO dto) {

        List<LocalDateTime> times = messageRepo.findRecentMessageTimes(dto.getSenderId(), PageRequest.of(0, 1));
        LocalDateTime last = times.isEmpty() ? null : times.get(0);

        if (last != null) {
            long seconds = Duration.between(last, LocalDateTime.now()).getSeconds();

            if (seconds < 10) {
                throw new CustomException(
                        "쪽지는 10초에 1번만 전송할 수 있습니다. (" + (10 - seconds) + "초 후 재전송 가능)", 429);
            }
        }

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


        pointService.usePoint(sender.getUserNo(), 10, "SEND_MESSAGE");

        messageRepo.save(msg);
    }

    // ⭐ 받은 쪽지 페이징 처리
    public Page<MessageDTO> getReceivedMessages(String receiverId, Pageable pageable) {
        User receiver = userRepo.findByUserId(receiverId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        return messageRepo.findByReceiverOrderBySendDateDesc(receiver, pageable)
                .map(MessageDTO::fromEntity);
    }

    // ⭐ 보낸 쪽지 페이징 처리
    public Page<MessageDTO> getSentMessages(String senderId, Pageable pageable) {
        User sender = userRepo.findByUserId(senderId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        return messageRepo.findBySenderOrderBySendDateDesc(sender, pageable)
                .map(MessageDTO::fromEntity);
    }

    @Transactional
    // ✅ 읽음 처리
    public void markAsRead(Long messageNo) {
        Message msg = messageRepo.findById(messageNo)
                .orElseThrow(() -> new RuntimeException("쪽지를 찾을 수 없습니다."));
        msg.setRead(true);
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
