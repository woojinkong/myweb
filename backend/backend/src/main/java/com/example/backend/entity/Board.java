package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Board {
     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long boardNo;

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String content;


    @Column(nullable = false)
    private String userId; // 작성자 (userId 또는 nickname)

    //private String imagePath; // ✅ 업로드된 이미지 경로
    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonManagedReference
    private List<BoardImage> images = new ArrayList<>();



    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;

     @Column(nullable = false)
    private int viewCount = 0; // ✅ 조회수 필드 추가

    // ⭐⭐⭐ 좋아요 개수 필드 추가 (정렬용)
    @Column(nullable = false)
    private int likeCount = 0;

    @PrePersist
    public void prePersist() {
        this.createdDate = LocalDateTime.now();
        this.viewCount = 0;
        this.likeCount = 0;  // ⭐ 기본값 보장

    }


    @PreUpdate
    public void preUpdate() {
        this.modifiedDate = LocalDateTime.now();
    }

    @OneToMany(mappedBy = "board", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonIgnore
    private List<BoardLike> likes = new ArrayList<>();

    // Board.java 일부
    @OneToMany(mappedBy = "board", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @jakarta.persistence.OrderBy("createdDate ASC")
    @com.fasterxml.jackson.annotation.JsonIgnore  // ⚠️ Board 응답에 댓글 전체를 싣지 않도록
    private List<Comment> comments = new ArrayList<>();

//    @Column(nullable = false)
//    private String category; // 예: "free", "game", "notice"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_group_id", nullable = false)
    private BoardGroup boardGroup;

    @Column(columnDefinition = "TEXT")
    private String plainContent;

    @Column(nullable = false)
    private boolean pinned = false;  // 기본값 false

    // Board.java
    @Column(nullable = false)
    private boolean linkAllowed = false; // 🔥 관리자 링크 허용 여부



}
