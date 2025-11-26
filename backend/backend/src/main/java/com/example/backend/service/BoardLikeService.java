package com.example.backend.service;

import org.springframework.stereotype.Service;

import com.example.backend.entity.Board;
import com.example.backend.entity.BoardLike;
import com.example.backend.repository.BoardLikeRepository;
import com.example.backend.repository.BoardRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

public class BoardLikeService {
    private final BoardLikeRepository likeRepository;
    private final BoardRepository boardRepository;
    
    @Transactional
    public boolean toggleLike(Long boardNo, String userId) {
        Board board = boardRepository.findById(boardNo).orElseThrow();
        boolean exists = likeRepository.existsByBoardAndUserId(board, userId);

        if (exists) {
            likeRepository.deleteByBoardAndUserId(board, userId);
            board.setLikeCount(board.getLikeCount() - 1); // ⭐ 감소
            boardRepository.save(board);
            return false; // 좋아요 취소
        } else {
            likeRepository.save(BoardLike.builder().board(board).userId(userId).build());
            board.setLikeCount(board.getLikeCount() + 1); // ⭐ 증가
            boardRepository.save(board);
            return true; // 좋아요 추가
        }
    }

    public long getLikeCount(Long boardNo) {
        Board board = boardRepository.findById(boardNo).orElseThrow();
        return likeRepository.countByBoard(board);
    }

    // ⭐ 추가: 특정 유저가 해당 글에 좋아요 눌렀는지 여부
    public boolean isLiked(Long boardNo, String userId) {
        Board board = boardRepository.findById(boardNo)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
        return likeRepository.existsByBoardAndUserId(board, userId);
    }
    
}
