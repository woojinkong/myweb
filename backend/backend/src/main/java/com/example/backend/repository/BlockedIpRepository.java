package com.example.backend.repository;

import com.example.backend.entity.BlockedIp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BlockedIpRepository extends JpaRepository<BlockedIp, Long> {

    Optional<BlockedIp> findByIp(String ip);

    boolean existsByIp(String ip);
}
