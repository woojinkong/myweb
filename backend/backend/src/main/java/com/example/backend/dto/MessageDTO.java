package com.example.backend.dto;

import com.example.backend.entity.Message;
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
    private String senderNickName;
    private String receiverId;  // ✅ 아이디 기반
    private String receiverNickName;
    private String content;
    private boolean read;
    private LocalDateTime sendDate;


    public static MessageDTO fromEntity(Message m) {
        return MessageDTO.builder()
                .messageNo(m.getMessageNo())
                .senderId(m.getSender().getUserId())
                .senderNickName(m.getSender().getNickName())
                .receiverId(m.getReceiver().getUserId())
                .receiverNickName(m.getReceiver().getNickName())
                .content(m.getContent())
                .read(m.isRead())
                .sendDate(m.getSendDate())
                .build();
    }



}


