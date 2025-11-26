package com.example.backend.auth;

import com.example.backend.service.BlockedIpService;
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
public class IpBlockFilter extends OncePerRequestFilter {

    private final BlockedIpService blockedIpService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        // 관리자 API는 IP 차단 제외
        if (path.startsWith("/api/admin")) {
            return true;
        }

	// 인증 관련 API 제외 → 로그인/회원가입/토큰 재발급까지 허용
    	if (path.startsWith("/api/auth")) {
    	    return true;
   	 }

            return false;
     }


    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) {
            ip = request.getRemoteAddr();
        } else {
            ip = ip.split(",")[0].trim();
        }


        if (blockedIpService.isBlocked(ip)) {
            response.sendError(403, "Access Denied (Blocked IP)");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
