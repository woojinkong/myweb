package com.example.backend.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CommentResponse {
    private Long commentNo;
    private Long parentId;        // null이면 최상위
    private String userId;
    private String nickName;
    private String content;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
    private String profileUrl; // ✅ 추가
    private Long boardNo; //
    private List<CommentResponse> children = new ArrayList<>();
}
