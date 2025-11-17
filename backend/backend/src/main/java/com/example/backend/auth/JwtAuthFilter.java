package com.example.backend.auth;

import com.example.backend.service.CustomUserDetailsService;
import com.example.backend.util.JwtUtil;
import com.example.backend.config.CustomUserDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;


    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        return path.startsWith("/uploads/");  // ⭐ 이미지 요청은 JWT 검사 제외
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

            // ✅ SecurityContext에 인증 객체 저장
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.debug("✅ [JwtAuthFilter] 인증 객체 SecurityContext에 저장 완료 (userId={})", userId);

        } catch (Exception e) {
            log.error("❌ [JwtAuthFilter] JWT 처리 중 예외 발생:", e);
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
