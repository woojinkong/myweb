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

    private Long groupId;     // 🔥 추가
    private String groupName; // 🔥 추가
    private boolean allowComment;

    private List<BoardImage> images;
    private String profileUrl;


}
