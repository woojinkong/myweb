package com.example.backend.service;

import com.example.backend.entity.Site;
import com.example.backend.repository.SiteRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SiteService {

    private final SiteRepository siteRepository;

    @PostConstruct
    public void initSite() {
        if (!siteRepository.existsById(1L)) {
            siteRepository.save(Site.builder()
                    .id(1L)
                    .siteName("KongHome")
                    .build());
        }
    }
}

