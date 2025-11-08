package com.example.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Long messageNo;
    private String senderId;    // ✅ 아이디 기반
    private String receiverId;  // ✅ 아이디 기반
    private String content;
    private boolean isRead;
    private LocalDateTime sendDate;
}
