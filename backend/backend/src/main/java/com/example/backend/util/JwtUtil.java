package com.example.backend.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import org.springframework.beans.factory.annotation.*;
import org.springframework.stereotype.Component;
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
        this.refreshExpMs = refreshExpDays * 24 * 60 * 60_000L;
    }

    public String createAccessToken(String subject) {
        return Jwts.builder()
                .setSubject(subject)
                .setExpiration(new Date(System.currentTimeMillis() + accessExpMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

     public String createRefreshToken(String subject) {
        return Jwts.builder()
                .setSubject(subject)
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

     public String getSubject(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
    }


}
