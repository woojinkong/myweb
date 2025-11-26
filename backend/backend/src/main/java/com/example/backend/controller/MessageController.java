package com.example.backend.controller;

import com.example.backend.dto.MessageDTO;
import com.example.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/message")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    // ✅ 쪽지 보내기
    @PostMapping("/send")
    public ResponseEntity<String> sendMessage(@RequestBody MessageDTO dto, Principal principal) {
        dto.setSenderId(principal.getName()); // ✅ JWT에서 userId 추출
        messageService.sendMessage(dto);
        return ResponseEntity.ok("쪽지 전송 완료");
    }

    // ✅ 받은 쪽지 목록
    @GetMapping("/received")
    public ResponseEntity<Page<MessageDTO>> getReceivedMessages(Principal principal ,
                                                                @RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "10") int size) {
        Page<MessageDTO> messages = messageService.getReceivedMessages(principal.getName(), PageRequest.of(page, size));
        return ResponseEntity.ok(messages);
    }

    // ✅ 보낸 쪽지 목록
    @GetMapping("/sent")
    public ResponseEntity<Page<MessageDTO>> getSentMessages(Principal principal,
                                                            @RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "10") int size) {
        Page<MessageDTO> messages = messageService.getSentMessages(principal.getName(), PageRequest.of(page, size));
        return ResponseEntity.ok(messages);
    }

    // ✅ 읽음 처리
    @PostMapping("/{messageNo}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long messageNo) {
        messageService.markAsRead(messageNo);
        return ResponseEntity.ok().build();
    }

    // ✅ 삭제
    @DeleteMapping("/{messageNo}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long messageNo) {
        messageService.deleteMessage(messageNo);
        return ResponseEntity.ok().build();
    }

    // ✅ 안 읽은 쪽지 개수 조회
@GetMapping("/unread-count")
public ResponseEntity<Long> getUnreadMessageCount(Principal principal) {
    long count = messageService.countUnreadMessages(principal.getName());
    return ResponseEntity.ok(count);
}

}
