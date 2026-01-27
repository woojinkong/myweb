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
    private static final Long SITE_ID = 1L;

    @PostConstruct
    public void initSite() {
        getOrInit(); // 1번만 초기화
    }

    public Site getOrInit() {
        Site site = siteRepository.findById(SITE_ID).orElseGet(() ->
                Site.builder()
                        .id(SITE_ID)
                        .siteName("KongHome")
                        .homeGroupCount(7)
                        .homeBoardCount(5)
                        .build()
        );

        boolean dirty = false;
        if (site.getHomeGroupCount() == null) { site.setHomeGroupCount(7); dirty = true; }
        if (site.getHomeBoardCount() == null) { site.setHomeBoardCount(5); dirty = true; }
        if (site.getSiteName() == null || site.getSiteName().isBlank()) { site.setSiteName("KongHome"); dirty = true; }

        return dirty ? siteRepository.save(site) : site;
    }

    public Site updateSiteName(String name) {
        Site site = getOrInit();
        site.setSiteName(name);
        return siteRepository.save(site);
    }

    public Site updateHomeSettings(int groupCount, int boardCount) {
        Site site = getOrInit();
        site.setHomeGroupCount(groupCount);
        site.setHomeBoardCount(boardCount);
        return siteRepository.save(site);
    }
}

