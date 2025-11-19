package com.example.backend.repository;

import com.example.backend.entity.Board;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BoardRepository extends JpaRepository<Board, Long> {


    List<Board> findByTitleContainingIgnoreCase(String title);
    List<Board> findByContentContainingIgnoreCase(String content);
    List<Board> findByUserIdContainingIgnoreCase(String userId);
        @Query("""
    SELECT DISTINCT b 
    FROM Board b 
    LEFT JOIN FETCH b.images 
    WHERE b.boardGroup.id = :groupId 
    ORDER BY b.createdDate DESC
    """)
    List<Board> findByBoardGroupIdOrderByCreatedDateDesc(Long groupId);

    @Query("SELECT COUNT(b) FROM Board b WHERE b.boardGroup.id = :groupId")
    int countByGroupId(Long groupId);

    List<Board> findByPlainContentContainingIgnoreCase(String keyword);


}
