package com.example.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.example.backend.config.CustomUserDetails;
import com.example.backend.service.BoardLikeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/board/like")
@RequiredArgsConstructor
public class BoardLikeController {

    private final BoardLikeService likeService;

    // 👍 좋아요 토글
    @PostMapping("/{boardNo}")
    public ResponseEntity<Boolean> toggleLike(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long boardNo
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean isLiked = likeService.toggleLike(boardNo, userDetails.getUser().getUserId());
        return ResponseEntity.ok(isLiked);
    }

    // ✅ 좋아요 개수 + 내가 눌렀는지 여부 같이 반환
    @GetMapping("/{boardNo}")
    public ResponseEntity<Map<String, Object>> getLikeInfo(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long boardNo
    ) {

        long count = likeService.getLikeCount(boardNo);

        boolean liked = false;
        if (userDetails != null) {
            liked = likeService.isLiked(boardNo, userDetails.getUser().getUserId());
        }

        Map<String, Object> body = new HashMap<>();
        body.put("count", count);
        body.put("liked", liked);

        return ResponseEntity.ok(body);
    }
}
