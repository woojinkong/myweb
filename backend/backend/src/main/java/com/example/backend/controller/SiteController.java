package com.example.backend.controller;

import com.example.backend.entity.Site;
import com.example.backend.repository.SiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/site")
@RequiredArgsConstructor
public class SiteController {

    private final SiteRepository siteRepository;

    // ⭐ 기본 사이트 ID 고정
    private static final Long SITE_ID = 1L;

    // 🔹 사이트 이름 조회 (누구나 가능)
    @GetMapping("/name")
    public ResponseEntity<String> getSiteName() {

        Site site = siteRepository.findById(SITE_ID)
                .orElse(Site.builder()
                        .id(SITE_ID)
                        .siteName("KongHome")
                        .build());
                 siteRepository.save(site);   // ⭐ DB 저장
        return ResponseEntity.ok(site.getSiteName());
    }

    // 🔹 사이트 이름 변경 (관리자만 가능)
    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/name")
    public ResponseEntity<?> updateSiteName(@RequestBody Map<String, String> req) {

        String name = req.get("siteName");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body("사이트 이름이 없습니다.");
        }

        Site site = siteRepository.findById(SITE_ID)
                .orElse(Site.builder().id(SITE_ID).build());

        site.setSiteName(name);
        siteRepository.save(site);

        return ResponseEntity.ok("사이트 이름이 변경되었습니다.");
    }

}
