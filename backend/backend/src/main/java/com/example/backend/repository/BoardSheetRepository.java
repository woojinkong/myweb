package com.example.backend.repository;

import com.example.backend.entity.BoardSheet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardSheetRepository extends JpaRepository<BoardSheet, Long> {
}
