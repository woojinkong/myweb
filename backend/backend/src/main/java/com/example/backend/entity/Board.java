package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Board {
     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long boardNo;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private String userId; // 작성자 (userId 또는 nickname)

    private String imagePath; // ✅ 업로드된 이미지 경로

    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;

     @Column(nullable = false)
    private int viewCount = 0; // ✅ 조회수 필드 추가

    @PrePersist
    public void prePersist() {
        this.createdDate = LocalDateTime.now();
        this.viewCount = 0; // ✅ 게시글 생성 시 초기값 0
    }

    @PreUpdate
    public void preUpdate() {
        this.modifiedDate = LocalDateTime.now();
    }

    @OneToMany(mappedBy = "board", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonIgnore
    private List<BoardLike> likes = new ArrayList<>();
}
