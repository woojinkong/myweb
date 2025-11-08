package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.AuthService;
import com.example.backend.service.EmailService;
import com.example.backend.util.JwtUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.net.InetAddress;
import java.util.Map;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;
    private final JwtUtil jwt;
    private final UserRepository repo;
    private final EmailService emailService;
    
    // ✅ 회원가입
    @PostMapping("/signup")
    public ResponseEntity<User> signup(@RequestBody SignupRequest r) {
        User saved = service.signup(r);
        saved.setUserPwd(null);
        return ResponseEntity.ok(saved);
    }

    // ✅ 로그인 (access 반환 + refresh 쿠키)
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest r) {
        User u = service.authenticate(r);
        if (u == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String access = service.newAccessToken(u);
        String refresh = service.newRefreshToken(u.getUserId());

        String serverHost = "192.168.123.107"; // 기본값

        try {
            serverHost = InetAddress.getLocalHost().getHostAddress();
        } catch (Exception ignored) {}

                ResponseCookie cookie = ResponseCookie.from("refreshToken", refresh)
                .httpOnly(true)
                .secure(false)     // HTTPS 배포 시 true
                // .domain(serverHost) ❌ 제거
                .path("/")
                .sameSite("Lax")  // ✅ None으로 변경해야 cross-origin에서 쿠키 전송 가능
                .maxAge(7 * 24 * 3600)
                .build();


                u.setUserPwd(null);
                return ResponseEntity.ok()
                        .header(HttpHeaders.SET_COOKIE, cookie.toString())
                        .body(new AuthResponse(access, u));
            }

    // ✅ 토큰 재발급
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(value = "refreshToken", required = false) String refresh
    ) {
        if (refresh == null) return ResponseEntity.status(401).build();

        try {
            String userId = jwt.getSubject(refresh);
            if (!jwt.validateToken(refresh)) {
                ResponseCookie clear = ResponseCookie.from("refreshToken", "")
                        .path("/")
                        .maxAge(0)
                        .httpOnly(true)
                        .build();
                return ResponseEntity.status(401)
                        .header(HttpHeaders.SET_COOKIE, clear.toString())
                        .build();
            }

            var user = repo.findByUserId(userId).orElseThrow();
            String newAccess = service.newAccessToken(user);
            user.setUserPwd(null);

            return ResponseEntity.ok(new AuthResponse(newAccess, user));
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    // ✅ 내 정보
    @GetMapping("/me")
    public ResponseEntity<User> me(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String auth) {
        if (auth == null || !auth.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }
        String userId = jwt.getSubject(auth.substring(7));
        var u = repo.findByUserId(userId).orElse(null);
        if (u == null) return ResponseEntity.status(401).build();
        u.setUserPwd(null);
        return ResponseEntity.ok(u);
    }

    // ✅ 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie clear = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clear.toString())
                .build();
    }

    // ✅ 이메일 인증 전송
    @PostMapping("/send-email-code")
    public ResponseEntity<?> sendEmailCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        emailService.sendVerificationCode(email);
        return ResponseEntity.ok(Map.of("success", true, "message", "인증번호가 발송되었습니다."));
    }

    // ✅ 이메일 인증 확인
    @PostMapping("/verify-email-code")
    public ResponseEntity<?> verifyEmailCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        boolean isValid = emailService.verifyCode(email, code);
        return ResponseEntity.ok(Map.of("success", isValid));
    }

    // ✅ 아이디 중복 검사
    @GetMapping("/check-id")
    public ResponseEntity<?> checkDuplicateId(@RequestParam String userId) {
        boolean exists = repo.existsByUserId(userId);
        return ResponseEntity.ok(Map.of("exists", exists));
    }
}
