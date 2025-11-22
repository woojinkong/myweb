package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.AuthService;
import com.example.backend.service.EmailService;
import com.example.backend.service.LoginAttemptService;
import com.example.backend.util.JwtUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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
    private final LoginAttemptService loginAttemptService;
    private final BCryptPasswordEncoder encoder;

    // ✅ 회원가입
    @PostMapping("/signup")
    public ResponseEntity<User> signup(@RequestBody SignupRequest r) {
        User saved = service.signup(r);
        saved.setUserPwd(null);
        return ResponseEntity.ok(saved);
    }

    // ✅ 로그인 (access 반환 + refresh 쿠키)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest r) {

        String userId = r.getUserId();

        // 1) 🚫 로그인 차단 여부 먼저 체크
        if (loginAttemptService.isBlocked(userId)) {
            long left = loginAttemptService.remainingMinutes(userId);
            return ResponseEntity.status(429).body(
                    Map.of("message", "로그인 시도 횟수가 초과되었습니다. " + left + "분 후 다시 시도하세요.")
            );
        }



        User u = repo.findByUserId(userId).orElse(null);
        if (u == null) {
            loginAttemptService.loginFailed(userId);   // ★ 실패 증가
            return ResponseEntity.status(401)
                    .body(Map.of("message", "아이디 또는 비밀번호가 잘못되었습니다."));
        }

        if (!encoder.matches(r.getUserPwd(), u.getUserPwd())) {
            loginAttemptService.loginFailed(userId);   // ★ 실패 증가
            return ResponseEntity.status(401)
                    .body(Map.of("message", "아이디 또는 비밀번호가 잘못되었습니다."));
        }

// 로그인 성공
        loginAttemptService.loginSucceeded(userId);


        // 2) 🚫 여기서 정지 유저 체크 추가!
        if (u.isBanned()) {

            ResponseCookie clear = ResponseCookie.from("refreshToken", "")
                    .path("/")
                    .maxAge(0)
                    .httpOnly(true)
                    .build();

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .header(HttpHeaders.SET_COOKIE, clear.toString())   // ⭐⭐ 여기 빠짐!!!
                    .body(Map.of(
                            "message", "정지된 계정입니다.",
                            "reason", u.getBanReason()
                    ));
        }

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

        // 🛑 이메일이 이미 존재하면 인증번호 발송 금지!
//        boolean exists = repo.existsByEmail(email);
//        if (exists) {
//            return ResponseEntity.status(HttpStatus.CONFLICT)
//                    .body(Map.of(
//                            "success", false,
//                            "message", "이미 가입된 이메일입니다."
//                    ));
//        }


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
