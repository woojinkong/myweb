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

        if ("OPTIONS".equals(method)) return true;


        // 🔓 게시판 / 댓글 "조회(GET)"만 JWT 스킵
        if (method.equals("GET") && (
                path.startsWith("/api/board") ||
                        path.startsWith("/api/board-group") ||
                        path.startsWith("/api/comments")
        )) {
            return true;
        }

        // 🔓 인증 관련
        return path.startsWith("/api/auth/login") ||
                path.startsWith("/api/auth/signup") ||
                path.startsWith("/api/auth/refresh") ||
                path.startsWith("/api/user/find-password") ||
                path.startsWith("/api/user/reset-password") ||
                path.startsWith("/api/auth/check-id") ||
                path.startsWith("/api/auth/send-email-code") ||
                path.startsWith("/api/auth/verify-email-code");
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
            if (!jwtUtil.validateToken(token)) {
                log.warn("⚠️ JWT 검증 실패");
                filterChain.doFilter(request, response);
                return;
            }

            String userId = jwtUtil.getSubject(token);
            log.debug("✅ [JwtAuthFilter] userId = {}", userId);

            // ✅ DB에서 실제 유저 정보 로드
            CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(userId);

            User user = userDetails.getUser();

            // 🚫 정지된 유저라면 차단
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

            // ✅ SecurityContext에 인증 객체 저장
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            activeUserService.updateActivity(userId);


            log.debug("✅ [JwtAuthFilter] 인증 객체 SecurityContext에 저장 완료 (userId={})", userId);

        } catch (Exception e) {
            log.error("❌ [JwtAuthFilter] JWT 처리 중 예외 발생:", e);
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
