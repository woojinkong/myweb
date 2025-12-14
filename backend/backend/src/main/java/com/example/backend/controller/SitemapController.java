package com.example.backend.controller;

import com.example.backend.entity.Board;
import com.example.backend.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class SitemapController {

    private final BoardRepository boardRepository;

    @Value("${site.base-url:https://konghome.kr}")
    private String baseUrl;

    private static final DateTimeFormatter FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    @Cacheable("sitemap")
    @GetMapping(value = "/sitemap.xml", produces = "application/xml; charset=UTF-8")
    public String sitemap() {

        List<Board> boards = boardRepository.findPublicBoardsForSitemap();

        StringBuilder sb = new StringBuilder();

        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n\n");

        // ===========================================================
        // 🌍 1) 홈 URL
        // ===========================================================
        sb.append("  <url>\n");
        sb.append("    <loc>").append(baseUrl).append("</loc>\n");
        sb.append("    <changefreq>daily</changefreq>\n");
        sb.append("    <priority>1.0</priority>\n");
        sb.append("  </url>\n\n");

        // ===========================================================
        // 📌 2) 게시글 URL 전체 자동 생성
        // ===========================================================
        for (Board b : boards) {
            sb.append("  <url>\n");
            sb.append("    <loc>").append(baseUrl).append("/board/").append(b.getBoardNo()).append("</loc>\n");

            // lastmod 설정
            if (b.getCreatedDate() != null) {
                sb.append("    <lastmod>")
                        .append(b.getCreatedDate().format(FORMAT))
                        .append("</lastmod>\n");
            }

            sb.append("    <changefreq>weekly</changefreq>\n");
            sb.append("    <priority>0.8</priority>\n");
            sb.append("  </url>\n\n");
        }

        sb.append("</urlset>");
        return sb.toString();
    }

}
