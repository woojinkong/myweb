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
import com.example.backend.entity.User;
import com.example.backend.repository.BoardRepository;
import com.example.backend.repository.CommentRepository;
import com.example.backend.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final BoardRepository boardRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // ✅ 댓글 작성 (대댓글 포함)
    @Transactional
    public CommentResponse add(Long boardNo, String userId, CommentRequest req) {
        Board board = boardRepository.findById(boardNo).orElseThrow();

        Comment parent = null;
        if (req.getParentId() != null) {
            parent = commentRepository.findById(req.getParentId()).orElseThrow();
            if (!parent.getBoard().getBoardNo().equals(boardNo)) {
                throw new IllegalArgumentException("부모 댓글과 게시글 불일치");
            }
        }

        // 댓글 작성 불가 게시판 체크
        if (!board.getBoardGroup().isAllowComment()) {
            throw new RuntimeException("이 게시판은 댓글 작성이 허용되지 않습니다.");
        }


        // ✅ 댓글 저장
        Comment saved = commentRepository.save(Comment.builder()
                .board(board)
                .userId(userId)
                .content(req.getContent())
                .parent(parent)
                .build());

            // ✅ 게시글 작성자에게 알림 (자기 자신 제외)
        if (!saved.getUserId().equals(board.getUserId())) {
            userRepository.findByUserId(board.getUserId()).ifPresent(boardWriter -> {
                notificationService.send(
                    boardWriter.getUserNo(),
                    saved.getUserId() + "님이 회원님의 게시글에 댓글을 달았습니다.",
                    "/board/" + board.getBoardNo()
                );
            });
        }

        // ✅ 부모 댓글 작성자에게 알림 (대댓글일 경우)
        // 단, 부모 댓글 작성자가 게시글 작성자와 다를 때만 알림 추가
        if (saved.getParent() != null) {
            Comment parentComment = saved.getParent();
            if (!saved.getUserId().equals(parentComment.getUserId())
                    && !parentComment.getUserId().equals(board.getUserId())) { // ✅ 중복 방지
                userRepository.findByUserId(parentComment.getUserId()).ifPresent(parentWriter -> {
                    notificationService.send(
                        parentWriter.getUserNo(),
                        saved.getUserId() + "님이 회원님의 댓글에 답글을 달았습니다.",
                        "/board/" + board.getBoardNo()
                    );
                });
            }
        }


        return toDto(saved, false);
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

    // ✅ 댓글 리스트 (대댓글 포함)
    @Transactional
    public List<CommentResponse> listTree(Long boardNo, int page, int size) {
        Board board = boardRepository.findById(boardNo).orElseThrow();

        // 🔥 댓글 금지 게시판 → 빈 리스트 반환
        if (!board.getBoardGroup().isAllowComment()) {
            return List.of(); // 빈 리스트
        }

        Page<Comment> tops = commentRepository
                .findByBoardAndParentIsNullOrderByCreatedDateAsc(board, PageRequest.of(page, size));

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

    // ====== DTO 매퍼 ======
    private CommentResponse toDto(Comment c, boolean shallow) {
    String profileUrl = null;

    // ✅ 유저의 프로필 이미지 조회
    Optional<User> userOpt = userRepository.findByUserId(c.getUserId());
    if (userOpt.isPresent()) {
        User user = userOpt.get();
        String img = user.getProfileImage();
        if (img != null && !img.isEmpty()) {
            // ✅ 이미지 경로가 이미 "/uploads/"로 시작하면 그대로 사용
            if (img.startsWith("/uploads/")) {
                profileUrl = img;
            } else {
                profileUrl = "/uploads/" + img;
            }
        }
    }

    return CommentResponse.builder()
            .commentNo(c.getCommentNo())
            .parentId(c.getParent() != null ? c.getParent().getCommentNo() : null)
            .userId(c.getUserId())
            .content(c.getContent())
            .createdDate(c.getCreatedDate())
            .modifiedDate(c.getModifiedDate())
            .profileUrl(profileUrl) // ✅ 프로필 이미지 경로 포함
            .build();
}



}
