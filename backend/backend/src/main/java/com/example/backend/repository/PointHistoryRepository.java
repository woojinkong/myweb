package com.example.backend.repository;

import com.example.backend.entity.PointHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PointHistoryRepository extends JpaRepository<PointHistory,Long> {
}
