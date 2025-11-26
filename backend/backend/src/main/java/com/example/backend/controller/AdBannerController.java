package com.example.backend.controller;

import com.example.backend.dto.AdBannerDTO;
import com.example.backend.service.AdBannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ads")
@RequiredArgsConstructor
public class AdBannerController {

    private final AdBannerService service;

    // 광고 불러오기
    @GetMapping("/{position}")
    public AdBannerDTO getAd(@PathVariable String position) {
        return service.getAd(position);
    }

    // 광고 업데이트 (ADMIN만 가능)
    @PostMapping("/update")
    public void updateAd(@RequestBody AdBannerDTO dto) {
        service.updateAd(dto);
    }
}
