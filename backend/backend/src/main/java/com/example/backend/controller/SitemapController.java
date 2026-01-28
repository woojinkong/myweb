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
import java.util.concurrent.atomic.AtomicReference;

@RestController
@RequiredArgsConstructor
public class SitemapController {

    private final BoardRepository boardRepository;

    @Value("${site.base-url:https://konghome.kr}")
    private String baseUrl;

    private static final DateTimeFormatter FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // ✅ 마지막으로 성공한 sitemap을 저장해둠 (서버/DB가 잠깐 죽어도 200을 내기 위함)
    private final AtomicReference<String> lastGoodSitemap = new AtomicReference<>(null);

    @GetMapping(value = "/sitemap.xml", produces = "application/xml; charset=UTF-8")
    public String sitemap() {
        try {
            // ✅ 캐시된 결과를 만들기 위한 "정상 생성" 시도
            String xml = buildSitemap();
            lastGoodSitemap.set(xml);
            return xml;
        } catch (Exception e) {
            // ✅ 1) 마지막 성공본이 있으면 그걸 반환 (5xx 방지)
            String last = lastGoodSitemap.get();
            if (last != null) return last;

            // ✅ 2) 그것도 없으면 최소 sitemap(홈만)이라도 반환 (무조건 200)
            return minimalSitemap();
        }
    }

    // ✅ 캐시는 "생성 메서드"에 걸어야 함
    @Cacheable("sitemap")
    public String buildSitemap() {
        List<Board> boards = boardRepository.findPublicBoardsForSitemap();

        StringBuilder sb = new StringBuilder();

        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n\n");

        // 1) 홈
        sb.append("  <url>\n");
        sb.append("    <loc>").append(baseUrl).append("</loc>\n");
        sb.append("    <changefreq>daily</changefreq>\n");
        sb.append("    <priority>1.0</priority>\n");
        sb.append("  </url>\n\n");

        // 2) 게시글
        for (Board b : boards) {
            sb.append("  <url>\n");
            sb.append("    <loc>").append(baseUrl).append("/board/").append(b.getBoardNo()).append("</loc>\n");

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

    private String minimalSitemap() {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n\n" +
                "  <url>\n" +
                "    <loc>" + baseUrl + "</loc>\n" +
                "    <changefreq>daily</changefreq>\n" +
                "    <priority>1.0</priority>\n" +
                "  </url>\n\n" +
                "</urlset>";
    }
}
