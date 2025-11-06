package com.example.backend.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CommentRequest {
    private String content;
    private Long parentId; // 대댓글이면 부모 ID, 아니면 null
}
