package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.AuthService;
import com.example.backend.util.JwtUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
 private final AuthService service;
    private final JwtUtil jwt;
    private final UserRepository repo;

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<User> signup(@RequestBody SignupRequest r) {
        User saved = service.signup(r);
        saved.setUserPwd(null);
        return ResponseEntity.ok(saved);
    }

    // 로그인: access 반환 + refresh 쿠키
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest r) {
        User u = service.authenticate(r);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String access = service.newAccessToken(u.getUserId());
        String refresh = service.newRefreshToken(u.getUserId());

        ResponseCookie cookie = ResponseCookie.from("refreshToken", refresh)
                .httpOnly(true)
                .path("/")                 // 경로 전체
                .sameSite("Lax")           // 로컬 개발은 Lax로 OK
                .maxAge(7 * 24 * 3600)     // 7일
                .build();

        u.setUserPwd(null);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new AuthResponse(access, u));
    }

    // 토큰 재발급 (쿠키에서 refresh 읽음)
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@CookieValue(value = "refreshToken", required = false) String refresh) {
        if (refresh == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            String userId = jwt.getSubject(refresh);
            var u = repo.findByUserId(userId).orElse(null);
            if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

            String newAccess = service.newAccessToken(userId);
            u.setUserPwd(null);
            return ResponseEntity.ok(new AuthResponse(newAccess, u));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    // 내 정보 (액세스 토큰 필요) - 테스트용
    @GetMapping("/me")
    public ResponseEntity<User> me(@RequestHeader(HttpHeaders.AUTHORIZATION) String auth) {
        if (auth == null || !auth.startsWith("Bearer ")) return ResponseEntity.status(401).build();
        String userId = jwt.getSubject(auth.substring(7));
        var u = repo.findByUserId(userId).orElse(null);
        if (u == null) return ResponseEntity.status(401).build();
        u.setUserPwd(null);
        return ResponseEntity.ok(u);
    }

    // 로그아웃: 쿠키 삭제
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie clear = ResponseCookie.from("refreshToken", "")
                .httpOnly(true).path("/").maxAge(0).build();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, clear.toString()).build();
    }

}
