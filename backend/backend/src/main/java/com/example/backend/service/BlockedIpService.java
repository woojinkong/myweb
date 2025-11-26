package com.example.backend.service;

import com.example.backend.entity.BlockedIp;
import com.example.backend.repository.BlockedIpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BlockedIpService {

    private final BlockedIpRepository blockedIpRepository;

    public boolean isBlocked(String ip) {
        return blockedIpRepository.existsByIp(ip);
    }

    public List<BlockedIp> getAll() {
        return blockedIpRepository.findAll();
    }

    public BlockedIp blockIp(String ip, String reason) {
        if (blockedIpRepository.existsByIp(ip)) {
            throw new RuntimeException("이미 차단된 IP입니다.");
        }

        BlockedIp blocked = BlockedIp.builder()
                .ip(ip)
                .reason(reason)
                .createdAt(LocalDateTime.now())
                .build();

        return blockedIpRepository.save(blocked);
    }

    public void unblockIp(Long id) {
        blockedIpRepository.deleteById(id);
    }
}
