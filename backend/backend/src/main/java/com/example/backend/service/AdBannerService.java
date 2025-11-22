package com.example.backend.service;

import com.example.backend.dto.AdBannerDTO;
import com.example.backend.entity.AdBanner;
import com.example.backend.repository.AdBannerRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdBannerService {

    private final AdBannerRepository repo;


    @PostConstruct
    public void init() {
        createIfNotExists("AD_TOP");
        createIfNotExists("AD_BOTTOM");
    }
    private void createIfNotExists(String position) {
        repo.findByPosition(position).orElseGet(() -> {
            AdBanner ad = new AdBanner();
            ad.setPosition(position);
            ad.setEnabled(false);
            ad.setWidth(728);
            ad.setHeight(90);
            return repo.save(ad);
        });
    }

    public AdBannerDTO getAd(String position) {
        return repo.findByPosition(position)
                .map(this::toDto)
                .orElseGet(() -> {
                    AdBannerDTO dto = new AdBannerDTO();
                    dto.setPosition(position);
                    dto.setEnabled(false);
                    dto.setWidth(728);
                    dto.setHeight(90);
                    dto.setImageUrl("");
                    dto.setLinkUrl("");
                    return dto;
                });
    }


    public void updateAd(AdBannerDTO dto) {
        AdBanner banner = repo.findByPosition(dto.getPosition())
                .orElseThrow(() -> new RuntimeException("광고 위치 없음"));

        banner.setImageUrl(dto.getImageUrl());
        banner.setLinkUrl(dto.getLinkUrl());
        banner.setWidth(dto.getWidth());
        banner.setHeight(dto.getHeight());
        banner.setEnabled(dto.getEnabled());

        repo.save(banner);
    }

    private AdBannerDTO toDto(AdBanner banner) {
        AdBannerDTO dto = new AdBannerDTO();
        dto.setPosition(banner.getPosition());
        dto.setImageUrl(banner.getImageUrl());
        dto.setLinkUrl(banner.getLinkUrl());
        dto.setWidth(banner.getWidth());
        dto.setHeight(banner.getHeight());
        dto.setEnabled(banner.getEnabled());
        return dto;
    }
}
