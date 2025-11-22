package com.example.backend.dto;

import java.time.LocalDateTime;

import com.example.backend.entity.Board;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BoardListResponse {

    private Long boardNo;
    private String title;
    private String userId;
    private String nickName;
    private int viewCount;
    private long commentCount;
    private String imagePath;
    private LocalDateTime createdDate;
    private Long groupId;       // 🔥 추가: 게시판 그룹 ID
    private String groupName;   // 🔥 추가: 게시판 그룹 이름
    private String profileUrl;
    private int likeCount;




}
