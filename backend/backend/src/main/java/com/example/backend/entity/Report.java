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
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 신고 대상 게시글
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_no", nullable = false)
    private Board board;

    // 신고한 사용자
    @Column(nullable = false)
    private String reporterId;

    // 신고 이유(사용자가 입력)
    @Column(nullable = false, length = 500)
    private String reason;

    // 신고 시간
    private LocalDateTime reportedAt;

    @PrePersist
    public void prePersist() {
        this.reportedAt = LocalDateTime.now();
    }
}
