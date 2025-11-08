package com.example.backend.repository;

import com.example.backend.entity.Board;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardRepository extends JpaRepository<Board, Long> {

    List<Board> findByCategoryOrderByCreatedDateDesc(String category);
    List<Board> findByTitleContainingIgnoreCase(String title);
    List<Board> findByContentContainingIgnoreCase(String content);
    List<Board> findByUserIdContainingIgnoreCase(String userId);

}
