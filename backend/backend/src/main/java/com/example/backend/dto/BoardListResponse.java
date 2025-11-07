package com.example.backend.dto;

import java.time.LocalDateTime;

import com.example.backend.entity.Board;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BoardListResponse {
    private Long boardNo;
    private String title;
    private String userId;
    private int viewCount;
    private long commentCount;
    private String imagePath;   // ✅ 추가
    private LocalDateTime createdDate;
    private String category; // ✅ 추가
    private String profileUrl;

    // ✅ Board → DTO 변환 생성자
    public BoardListResponse(Board board) {
        this.boardNo = board.getBoardNo();
        this.title = board.getTitle();
        this.userId = board.getUserId();
        this.viewCount = board.getViewCount();
        this.commentCount = 0; // 필요시 실제 댓글 수로 대체 가능
        this.imagePath = (board.getImages() != null && !board.getImages().isEmpty())
                ? board.getImages().get(0).getImagePath() // 첫 번째 이미지만
                : null;
        this.createdDate = board.getCreatedDate(); // 필드명 확인 필요
        this.category = board.getCategory();
        this.profileUrl = null; // 기본값 (Service에서 채워줌)
    }
}

