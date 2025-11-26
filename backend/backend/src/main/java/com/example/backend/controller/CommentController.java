package com.example.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.CommentRequest;
import com.example.backend.dto.CommentResponse;
import com.example.backend.service.CommentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // ✅ 목록(트리) — 상위 댓글 페이징 + 각 상위의 children 포함
    @GetMapping
    public ResponseEntity<List<CommentResponse>> list(
            @RequestParam Long boardNo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(commentService.listTree(boardNo, page, size));
    }

    // ✅ 작성
    @PostMapping("/{boardNo}")
    public ResponseEntity<CommentResponse> add(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long boardNo,
            @RequestBody CommentRequest req
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        CommentResponse saved = commentService.add(boardNo, principal.getUser().getUserId(), req);
        return ResponseEntity.ok(saved);
    }

    // ✅ 수정 (작성자만)
    @PutMapping("/{commentNo}")
    public ResponseEntity<CommentResponse> edit(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long commentNo,
            @RequestBody CommentRequest req
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        CommentResponse updated = commentService.edit(commentNo, principal.getUser().getUserId(), req.getContent());
        return ResponseEntity.ok(updated);
    }

    // ✅ 삭제 (작성자 또는 관리자)
    @DeleteMapping("/{commentNo}")
    public ResponseEntity<Void> remove(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long commentNo
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        boolean isAdmin = principal.getUser().getRole() != null && principal.getUser().getRole().contains("ADMIN");
        commentService.remove(commentNo, principal.getUser().getUserId(), isAdmin);
        return ResponseEntity.noContent().build();
    }

    // ✅ 카운트
    @GetMapping("/count")
    public ResponseEntity<Long> count(@RequestParam Long boardNo) {
        return ResponseEntity.ok(commentService.count(boardNo));
    }

    @GetMapping("/comments/count")
    public long getCommentCount(@RequestParam Long boardNo) {
        return commentService.countByBoardNo(boardNo);
    }

}
