package com.example.backend.controller;

import com.example.backend.entity.Site;
import com.example.backend.repository.SiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.backend.service.SiteService;


import java.util.Map;

@RestController
@RequestMapping("/api/site")
@RequiredArgsConstructor
public class SiteController {

    private final SiteService siteService;

    // 누구나 조회
    @GetMapping("/name")
    public ResponseEntity<String> getSiteName() {
        return ResponseEntity.ok(siteService.getOrInit().getSiteName());
    }

    // 관리자만 변경
    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/name")
    public ResponseEntity<?> updateSiteName(@RequestBody Map<String, String> req) {
        String name = req.get("siteName");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body("사이트 이름이 없습니다.");
        }
        siteService.updateSiteName(name.trim());
        return ResponseEntity.ok("사이트 이름이 변경되었습니다.");
    }

    // 누구나 조회 (홈에 쓰니까)
    @GetMapping("/home-settings")
    public ResponseEntity<?> getHomeSettings() {
        Site site = siteService.getOrInit();
        return ResponseEntity.ok(Map.of(
                "homeGroupCount", site.getHomeGroupCount(),
                "homeBoardCount", site.getHomeBoardCount()
        ));
    }

    // 관리자만 변경
    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/home-settings")
    public ResponseEntity<?> updateHomeSettings(@RequestBody Map<String, Integer> req) {
        Integer groupCount = req.get("homeGroupCount");
        Integer boardCount = req.get("homeBoardCount");

        if (groupCount == null || boardCount == null) {
            return ResponseEntity.badRequest().body("homeGroupCount / homeBoardCount 값이 필요합니다.");
        }
        if (groupCount < 1 || groupCount > 30) return ResponseEntity.badRequest().body("homeGroupCount는 1~30");
        if (boardCount < 1 || boardCount > 30) return ResponseEntity.badRequest().body("homeBoardCount는 1~30");

        siteService.updateHomeSettings(groupCount, boardCount);
        return ResponseEntity.ok("홈 표시 설정이 변경되었습니다.");
    }
}
