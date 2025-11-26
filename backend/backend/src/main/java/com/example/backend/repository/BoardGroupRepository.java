package com.example.backend.repository;

import com.example.backend.entity.BoardGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BoardGroupRepository extends JpaRepository<BoardGroup,Long> {

    // 게시판 이름 중복 체크용
    boolean existsByName(String name);

    BoardGroup findByOrderIndex(int orderIndex);

    @Query("SELECT COALESCE(MAX(g.orderIndex), 0) FROM BoardGroup g")
    int findMaxOrderIndex();

    List<BoardGroup> findAllByOrderByOrderIndexAsc();



}
