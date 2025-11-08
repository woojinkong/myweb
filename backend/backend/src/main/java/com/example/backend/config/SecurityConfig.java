package com.example.backend.config;

import com.example.backend.auth.JwtAuthFilter;
import com.example.backend.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CustomUserDetailsService customUserDetailsService;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // ✅ 1. CSRF 끄기 (JWT 사용 시 필수)
            .csrf(csrf -> csrf.disable())

            // ✅ 2. CORS 설정
            .cors(cors -> cors.configurationSource(corsSource()))

            // ✅ 3. 세션을 STATELESS로 설정 (JWT 기반 인증에서는 세션 사용 안 함)
            .sessionManagement(session -> session.sessionCreationPolicy(
                org.springframework.security.config.http.SessionCreationPolicy.STATELESS
            ))

            // ✅ 4. 요청별 권한 설정
            .authorizeHttpRequests(auth -> auth
                // ⭕ 인증 없이 접근 가능한 경로
                .requestMatchers(
                    "/api/auth/**",             // 로그인, 회원가입, 토큰 관련
                    "/api/user/find-password",  // 비밀번호 찾기
                    "/api/user/reset-password", // 비밀번호 재설정
                    "/uploads/**"               // 이미지 업로드된 파일 접근
                ).permitAll()

                // ✅ 게시판 / 댓글 조회는 누구나 가능
                .requestMatchers(HttpMethod.GET, "/api/board/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/comments/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()

                // ✅ 관리자 전용 경로
                .requestMatchers("/api/admin/**").hasAuthority("ADMIN")

                // ✅ 일반 인증 필요 (USER, ADMIN 둘 다 가능)
                .requestMatchers("/api/board/**").authenticated()
                .requestMatchers("/api/user/**").authenticated()
                .requestMatchers("/api/comments/**").authenticated()
                .requestMatchers("/api/board/like/**").authenticated()
                .requestMatchers("/api/notifications/**").authenticated()
                .requestMatchers("/api/message/**").authenticated()


                // ✅ 그 외 요청은 허용
                .anyRequest().permitAll()
            )

            // ✅ 5. JWT 필터 등록
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ✅ 6. CORS 설정
    @Bean
    public CorsConfigurationSource corsSource() {
        CorsConfiguration config = new CorsConfiguration();

        // ✅ React 개발 서버 (로컬 + LAN)
        config.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://192.168.123.107:5173"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // ✅ 7. AuthenticationManager 등록
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
