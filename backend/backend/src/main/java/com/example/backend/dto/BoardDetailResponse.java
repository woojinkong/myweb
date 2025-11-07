package com.example.backend.dto;

import java.time.LocalDateTime;
import java.util.List;
import com.example.backend.entity.BoardImage;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BoardDetailResponse {
    private Long boardNo;
    private String title;
    private String content;
    private String userId;
    private LocalDateTime createdDate;
    private int viewCount;
    private String category;
    private List<BoardImage> images;
    private String profileUrl; // ✅ 프로필 URL 추가
}
