package com.example.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Site {

    @Id
    private Long id;

    private String siteName;

    // ✅ 추가: 홈 화면 표시 설정
    private Integer homeGroupCount;  // 홈에 노출할 그룹 수
    private Integer homeBoardCount;  // 각 그룹에서 노출할 게시글 수


}
