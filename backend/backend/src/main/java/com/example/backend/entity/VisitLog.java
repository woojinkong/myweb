package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "visit_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long visitId;

    @Column(nullable = false)
    private String ipAddress; // 방문자 IP

    @Column(nullable = false)
    private LocalDateTime visitDate; // 방문 시간

    // ✅ 유입/기기 정보
    @Column(length = 1000)
    private String referrer;

    @Column(length = 20)
    private String sourceType; // NAVER/GOOGLE/SNS/DIRECT/ETC

    @Column(length = 255)
    private String visitPath;

    @Column(length = 500)
    private String userAgent;

    // ✅ 로그인 유저면 연결 (선택)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_no")
    private User user;
}
