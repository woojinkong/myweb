package com.example.backend.config;

import com.example.backend.auth.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
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

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // ⭐ 추가: 인증 실패 시 401 응답
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, authException) -> {
                            res.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                        })
                )


                .authorizeHttpRequests(auth -> auth

                        /* ============================
                           🔓  로그인 / 회원가입 / 비번찾기
                         ============================ */
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/signup",
                                "/api/auth/refresh",
                                "/api/auth/logout",
                                "/api/auth/find-password",
                                "/api/auth/reset-password",
                                // ⭐ 회원가입용 추가
                                "/api/auth/check-id",
                                "/api/auth/send-email-code",
                                "/api/auth/verify-email-code",

                                "/api/user/find-password",
                                "/api/user/reset-password"

                                ).permitAll()

                        /* ============================
                           📌 게시판/댓글 조회 (비로그인 허용)
                         ============================ */
                        .requestMatchers(HttpMethod.GET, "/api/board/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/comments/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/board-group/**").permitAll()
                        .requestMatchers("/api/site/name").permitAll()
                        .requestMatchers("/api/contact/**").permitAll()

                        /* ===========================
                           🛎 알림 API (로그인 필요)=
                         ============================ */
                        .requestMatchers(HttpMethod.GET, "/api/notifications/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/notifications/**").authenticated()

                        /* ============================
                           💬 메시지 API (로그인 필요)
                         ============================ */
                        .requestMatchers(HttpMethod.GET, "/api/message/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/message/**").authenticated()

                        /* ============================
                           👤 현재 로그인 유저 정보
                         ============================ */
                        .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()

                        /* ============================
                           🔐 관리자 전용 API
                         ============================ */
                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/board-group/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/board-group/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/board-group/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/admin/**").hasAuthority("ADMIN")



                        /* ============================
                           📌 나머지는 로그인 필수
                         ============================ */
                        .anyRequest().authenticated()
                )

                // JWT 인증 필터 등록
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://192.168.123.107:5173"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        config.addAllowedHeader("*");
        config.addExposedHeader("Authorization");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
