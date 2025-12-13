package com.example.backend.auth;

import com.example.backend.service.VisitService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class VisitLogFilter extends OncePerRequestFilter {

    private final VisitService visitService;

    // ❌ 기록 제외 확장자
    private static final Set<String> EXCLUDED_EXTENSIONS = Set.of(
            ".js", ".css", ".ico", ".png", ".jpg", ".jpeg",
            ".webp", ".svg", ".map", ".gif"
    );

    // ❌ 기록 제외 prefix
    private static final Set<String> EXCLUDED_PREFIXES = Set.of(
            "/assets",
            "/static",
            "/uploads",
            "/favicon",
            "/error"
    );

    // ❌ 기록 제외 URI
    private static final Set<String> EXCLUDED_PATHS = Set.of(
            "/robots.txt",
            "/sitemap.xml",
            "/hc",
            "/env"
    );

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            if (shouldRecord(request)) {
                visitService.recordVisit(request);
            }
        } catch (Exception e) {
            // 🔥 방문 로그 실패로 서비스 전체에 영향 주면 안 됨
            // 로그만 남기고 무시
            System.err.println("[VisitLogFilter] visit log failed: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /* ==========================
       🔍 기록 여부 판단
    ========================== */
    private boolean shouldRecord(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String method = request.getMethod();
        String ua = request.getHeader("User-Agent");

        // 1️⃣ GET 요청만 기록
        if (!"GET".equalsIgnoreCase(method)) return false;

        // 2️⃣ User-Agent 없는 요청 제외 (대부분 봇)
        if (ua == null || ua.isBlank()) return false;

        String lowerUa = ua.toLowerCase();

        // 3️⃣ 봇 / 스캐너 / 자동화 도구 제외
        if (
                lowerUa.contains("bot") ||
                        lowerUa.contains("spider") ||
                        lowerUa.contains("crawl") ||
                        lowerUa.contains("scanner") ||
                        lowerUa.contains("python") ||
                        lowerUa.contains("curl") ||
                        lowerUa.contains("wget")
        ) {
            return false;
        }

        // 4️⃣ 제외 prefix
        for (String prefix : EXCLUDED_PREFIXES) {
            if (uri.startsWith(prefix)) return false;
        }

        // 5️⃣ 제외 path
        if (EXCLUDED_PATHS.contains(uri)) return false;

        // 6️⃣ 제외 확장자
        for (String ext : EXCLUDED_EXTENSIONS) {
            if (uri.endsWith(ext)) return false;
        }

        return true;
    }
}
