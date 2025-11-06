package com.example.backend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.Board;
import com.example.backend.entity.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    // 최상위 댓글(부모 없음) 페이징 조회
    Page<Comment> findByBoardAndParentIsNullOrderByCreatedDateAsc(Board board, Pageable pageable);

    // 특정 부모의 대댓글들
    List<Comment> findByParentOrderByCreatedDateAsc(Comment parent);

    // 게시글 전체 댓글 개수
    long countByBoard(Board board);

    // 소유권 체크용
    boolean existsByCommentNoAndUserId(Long commentNo, String userId);
}
