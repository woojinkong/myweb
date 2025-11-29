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
    private boolean hasNew;   // ⭐ 오늘 새 글 있는지 여부
}
