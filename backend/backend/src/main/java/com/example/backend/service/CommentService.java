package com.example.backend.service;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.example.backend.dto.CommentRequest;
import com.example.backend.dto.CommentResponse;
import com.example.backend.entity.Board;
import com.example.backend.entity.Comment;
import com.example.backend.repository.BoardRepository;
import com.example.backend.repository.CommentRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final BoardRepository boardRepository;

    // ✅ 댓글 작성 (대댓글 포함)
    @Transactional
    public CommentResponse add(Long boardNo, String userId, CommentRequest req) {
        Board board = boardRepository.findById(boardNo).orElseThrow();

        Comment parent = null;
        if (req.getParentId() != null) {
            parent = commentRepository.findById(req.getParentId()).orElseThrow();
            // 같은 게시물인지 가드
            if (!parent.getBoard().getBoardNo().equals(boardNo)) {
                throw new IllegalArgumentException("부모 댓글과 게시글 불일치");
            }
        }

        Comment saved = commentRepository.save(Comment.builder()
                .board(board)
                .userId(userId)
                .content(req.getContent())
                .parent(parent)
                .build());

        return toDto(saved, false); // 작성 직후라 children 필요 없음
    }

    // ✅ 댓글 수정 (작성자만)
    @Transactional
    public CommentResponse edit(Long commentNo, String userId, String content) {
        Comment c = commentRepository.findById(commentNo).orElseThrow();
        if (!c.getUserId().equals(userId)) {
            throw new SecurityException("수정 권한 없음");
        }
        c.setContent(content);
        return toDto(c, false);
    }

    // ✅ 댓글 삭제 (작성자 또는 관리자)
    @Transactional
    public void remove(Long commentNo, String userId, boolean isAdmin) {
        Comment c = commentRepository.findById(commentNo).orElseThrow();
        if (!isAdmin && !c.getUserId().equals(userId)) {
            throw new SecurityException("삭제 권한 없음");
        }
        commentRepository.delete(c); // 자식은 orphanRemoval로 같이 삭제
    }

    // ✅ 최상위 댓글 페이징 + 각 댓글의 대댓글 묶어 반환
    @Transactional
    public List<CommentResponse> listTree(Long boardNo, int page, int size) {
        Board board = boardRepository.findById(boardNo).orElseThrow();
        Page<Comment> tops = commentRepository
                .findByBoardAndParentIsNullOrderByCreatedDateAsc(board, PageRequest.of(page, size));

        // 필요 시 쿼리 수 줄이는 최적화도 가능하지만, 우선 각 top에 대한 children 조회
        return tops.getContent().stream()
                .map(top -> {
                    CommentResponse dto = toDto(top, false);
                    List<Comment> replies = commentRepository.findByParentOrderByCreatedDateAsc(top);
                    dto.setChildren(replies.stream().map(r -> toDto(r, true)).collect(Collectors.toList()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public long count(Long boardNo) {
        Board board = boardRepository.findById(boardNo).orElseThrow();
        return commentRepository.countByBoard(board);
    }

    // ====== Mapper ======
    private CommentResponse toDto(Comment c, boolean shallow) {
        CommentResponse dto = CommentResponse.builder()
                .commentNo(c.getCommentNo())
                .parentId(c.getParent() != null ? c.getParent().getCommentNo() : null)
                .userId(c.getUserId())
                .content(c.getContent())
                .createdDate(c.getCreatedDate())
                .modifiedDate(c.getModifiedDate())
                .build();

        // shallow=false 이면서 필요하면 자식 재귀 매핑 가능
        // 지금은 listTree에서 자식 따로 넣어주므로 기본은 비워둠
        return dto;
    }
}
