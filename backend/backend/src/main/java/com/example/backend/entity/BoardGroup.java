package com.example.backend.entity;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BoardGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // 게시판 이름

    @Column(nullable = false)
    private boolean adminOnlyWrite = false; // 관리자만 글쓰기?

    @Column(nullable = false)
    private boolean allowComment = true; // 댓글 허용?

    private LocalDateTime createdDate;

    @PrePersist
    public void prePersist() {
        createdDate = LocalDateTime.now();
    }

    @Column(nullable = false)
    private int orderIndex;

    @Transient
    private int boardCount;

    @Column(nullable = false)
    private String type = "BOARD";  // ⭐ 기본값은 무조건 BOARD !!




}
