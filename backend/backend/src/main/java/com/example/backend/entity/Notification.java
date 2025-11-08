package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "notification") // ✅ 명시적 테이블명 추천 (충돌 방지)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long receiverUserNo; // 알림을 받을 유저 번호
    private String message;      // 알림 내용
    private String link;         // 이동할 링크 (예: /board/3)
    private boolean isRead;      // 읽음 여부
    private LocalDateTime createdDate;

    @PrePersist
    public void prePersist() {
        this.createdDate = LocalDateTime.now();
        this.isRead = false;
    }
}
