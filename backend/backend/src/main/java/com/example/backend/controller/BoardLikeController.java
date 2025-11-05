package com.example.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.config.CustomUserDetails;
import com.example.backend.service.BoardLikeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/board/like")
@RequiredArgsConstructor
public class BoardLikeController {
    private final BoardLikeService likeService;

    @PostMapping("/{boardNo}")
    public ResponseEntity<Boolean> toggleLike(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long boardNo
    ) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        boolean isLiked = likeService.toggleLike(boardNo, userDetails.getUser().getUserId());
        return ResponseEntity.ok(isLiked);
    }

    @GetMapping("/{boardNo}")
    public ResponseEntity<Long> getLikeCount(@PathVariable Long boardNo) {
        return ResponseEntity.ok(likeService.getLikeCount(boardNo));
    }
}
