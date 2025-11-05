package com.example.backend.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key key;
    private final long accessExpMs;
    private final long refreshExpMs;

    public JwtUtil(
            @Value("${konghome.jwt.secret}") String secret,
            @Value("${konghome.jwt.access-exp-min}") long accessExpMin,
            @Value("${konghome.jwt.refresh-exp-days}") long refreshExpDays
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessExpMs = accessExpMin * 60_000; // 분 → 밀리초
        this.refreshExpMs = refreshExpDays * 24 * 60 * 60 * 1000L; // 일 → 밀리초
    }

    // ✅ Access Token 생성
    public String createAccessToken(String subject) {
        return Jwts.builder()
                .setSubject(subject)
                .setExpiration(new Date(System.currentTimeMillis() + accessExpMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ Refresh Token 생성
    public String createRefreshToken(String subject) {
        return Jwts.builder()
                .setSubject(subject)
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("⚠️ JWT 만료됨: " + e.getMessage());
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("❌ JWT 유효하지 않음: " + e.getMessage());
        }
        return false;
    }

    // ✅ 토큰에서 subject(userId) 추출
    public String getSubject(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (Exception e) {
            System.out.println("❌ JWT subject 추출 실패: " + e.getMessage());
            return null;
        }
    }
}
