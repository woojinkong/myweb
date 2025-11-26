package com.example.backend.controller;

import com.example.backend.dto.ContactRequest;
import com.example.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final EmailService emailService;

    // 문의 메일 전송
    @PostMapping("/send")
    public ResponseEntity<String> sendContact(@RequestBody ContactRequest req) {

        String adminEmail = "dodejqn6@naver.com"; // 받는 관리자 이메일

        String subject = "[문의] " + req.getSubject();
        String content = """
                [문의 접수]

                보낸 사람 이메일: %s

                --------------------------
                문의 내용
                --------------------------
                %s
                """.formatted(req.getEmail(), req.getMessage());

        emailService.sendCustomEmail(adminEmail, subject, content);

        return ResponseEntity.ok("문의가 접수되었습니다.");
    }
}
