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
            return false; // 좋아요 취소
        } else {
            likeRepository.save(BoardLike.builder().board(board).userId(userId).build());
            return true; // 좋아요 추가
        }
    }

    public long getLikeCount(Long boardNo) {
        Board board = boardRepository.findById(boardNo).orElseThrow();
        return likeRepository.countByBoard(board);
    }
    
}
