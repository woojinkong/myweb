package com.example.backend.repository;

import com.example.backend.entity.AdBanner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdBannerRepository extends JpaRepository<AdBanner, Long> {
    Optional<AdBanner> findByPosition(String position);
}
