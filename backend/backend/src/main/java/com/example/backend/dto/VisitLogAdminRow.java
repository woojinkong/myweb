package com.example.backend.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class VisitLogAdminRow {
    private Long visitId;
    private LocalDateTime visitDate;
    private String sourceType;
    private String visitPath;
    private String referrer;   // 필요 시
    private String ipAddress;  // 필요 시
    private String userId;     // 로그인 유저면
    private String nickname;
}
