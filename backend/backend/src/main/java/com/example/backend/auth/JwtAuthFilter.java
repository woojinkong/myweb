package com.example.backend.auth;

import com.example.backend.entity.User;
import com.example.backend.service.ActiveUserService;
import com.example.backend.service.CustomUserDetailsService;
import com.example.backend.util.JwtUtil;
import com.example.backend.config.CustomUserDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.core.annotation.Order;
import java.io.IOException;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    @Autowired
    private ActiveUserService activeUserService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // 🔓 공개 리소스
        if (path.startsWith("/uploads/")) return true;
        if ("OPTIONS".equalsIgnoreCase(method)) return true;

        // 🔓 인증 관련
        if (path.startsWith("/api/auth/login") ||
                path.startsWith("/api/auth/signup") ||
                path.startsWith("/api/auth/refresh") ||
                path.startsWith("/api/user/find-password") ||
                path.startsWith("/api/user/reset-password") ||
                path.startsWith("/api/auth/check-id") ||
                path.startsWith("/api/auth/send-email-code") ||
                path.startsWith("/api/auth/verify-email-code")) {
            return true;
        }

        // ✅ 게시판/댓글/그룹 조회(GET)는 "비로그인 요청"일 때만 스킵
        if ("GET".equalsIgnoreCase(method) && (
                path.startsWith("/api/board") ||
                        path.startsWith("/api/board-group") ||
                        path.startsWith("/api/comments")
        )) {
            String authHeader = request.getHeader("Authorization");
            // Bearer 토큰이 없으면 스킵(=완전 비로그인 조회)
            return (authHeader == null || !authHeader.startsWith("Bearer "));
        }

        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        log.debug("🔑 [JwtAuthFilter] Authorization Header = {}", authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            // ✅ 토큰이 만료/불일치면 "흘려보내지 말고" 401 내려서 프론트 refresh 유도
            if (!jwtUtil.validateToken(token)) {
                log.warn("⚠️ JWT 검증 실패(만료/불일치) → 401");
                SecurityContextHolder.clearContext();
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

            String userId = jwtUtil.getSubject(token);
            log.debug("✅ [JwtAuthFilter] userId = {}", userId);

            CustomUserDetails userDetails =
                    (CustomUserDetails) userDetailsService.loadUserByUsername(userId);

            User user = userDetails.getUser();

            if (user.isBanned()) {
                log.warn("🚫 정지된 사용자 접근 차단: {}", userId);
                response.setStatus(HttpStatus.FORBIDDEN.value());
                response.setContentType("application/json; charset=UTF-8");
                response.getWriter().write(
                        "{\"message\": \"정지된 계정입니다.\", \"reason\": \"" +
                                user.getBanReason() + "\"}"
                );
                return;
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            activeUserService.updateActivity(userId);
            log.debug("✅ [JwtAuthFilter] 인증 객체 저장 완료 (userId={})", userId);

        } catch (Exception e) {
            log.error("❌ [JwtAuthFilter] JWT 처리 중 예외 발생:", e);
            SecurityContextHolder.clearContext();
            // 예외도 401로 통일(프론트 refresh 유도)
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
