package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.BoardImage;

public interface BoardImageRepository extends JpaRepository<BoardImage, Long>{
    
}
