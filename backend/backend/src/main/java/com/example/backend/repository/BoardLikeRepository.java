package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.Board;
import com.example.backend.entity.BoardLike;

public interface BoardLikeRepository extends JpaRepository<BoardLike, Long>{
     boolean existsByBoardAndUserId(Board board, String userId);
    void deleteByBoardAndUserId(Board board, String userId);
    long countByBoard(Board board);
}
