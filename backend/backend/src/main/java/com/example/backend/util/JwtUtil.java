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
        this.accessExpMs = accessExpMin * 60_000;
        this.refreshExpMs = refreshExpDays * 24 * 60 * 60 * 1000L;
    }

    // ✅ Access Token 생성 (role 포함)
    public String createAccessToken(String userId, String role) {
        return Jwts.builder()
                .setSubject(userId)
                .claim("role", role) // ✅ 역할 정보 포함
                .setExpiration(new Date(System.currentTimeMillis() + accessExpMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ Refresh Token 생성
    public String createRefreshToken(String userId) {
        return Jwts.builder()
                .setSubject(userId)
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("⚠️ JWT 만료됨: " + e.getMessage());
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("❌ JWT 유효하지 않음: " + e.getMessage());
        }
        return false;
    }

    // ✅ 토큰에서 userId(subject) 추출
    public String getSubject(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(key).build()
                    .parseClaimsJws(token).getBody().getSubject();
        } catch (Exception e) {
            System.out.println("❌ JWT subject 추출 실패: " + e.getMessage());
            return null;
        }
    }

    // ✅ 토큰에서 role 추출
    public String getRole(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.get("role", String.class);
        } catch (Exception e) {
            System.out.println("❌ JWT role 추출 실패: " + e.getMessage());
            return null;
        }
    }
}
