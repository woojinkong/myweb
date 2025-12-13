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

@Component
@RequiredArgsConstructor
public class VisitLogFilter extends OncePerRequestFilter {

    private final VisitService visitService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();

        // ❌ 방문 로그에서 제외할 경로들 (정적 리소스 / 의미없는 요청)
        if (
                uri.startsWith("/assets") ||
                        uri.startsWith("/static") ||
                        uri.startsWith("/uploads") ||
                        uri.startsWith("/favicon") ||
                        uri.endsWith(".js") ||
                        uri.endsWith(".css") ||
                        uri.endsWith(".ico") ||
                        uri.endsWith(".png") ||
                        uri.endsWith(".jpg") ||
                        uri.endsWith(".jpeg") ||
                        uri.endsWith(".webp") ||
                        uri.endsWith(".svg") ||
                        uri.endsWith(".map") ||
                        uri.equals("/robots.txt") ||
                        uri.equals("/sitemap.xml")
        ) {
            filterChain.doFilter(request, response);
            return;
        }

        // ✅ 의미 있는 요청만 방문 기록
        visitService.recordVisit(request);

        filterChain.doFilter(request, response);
    }
}
