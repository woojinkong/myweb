package com.example.backend.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class BoardListResponse {
     private Long boardNo;
    private String title;
    private String userId;
    private int viewCount;
    private long commentCount;
    private String imagePath;   // ✅ 추가
    private LocalDateTime createdDate;
    private String category; // ✅ 추가
}
