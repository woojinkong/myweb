package com.example.backend.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BoardGroupResponse {
    private Long groupId;
    private String name;
    private String type;
    private boolean hasNew;   // ⭐ 오늘 새 글 있는지 여부
    private boolean adminOnly;        // 관리자만 접근 가능한 게시판?
    private boolean passwordEnabled;
    private String linkUrl;



}
