package com.example.backend.service;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.SignupRequest;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.util.JwtUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;


@Service @RequiredArgsConstructor
public class AuthService {
    private final UserRepository repo;
    private final BCryptPasswordEncoder encoder;
    private final JwtUtil jwt;


     public User signup(SignupRequest r) {
        if (repo.existsByUserId(r.getUserId())) throw new RuntimeException("이미 존재하는 아이디");

        User u = User.builder()
                .userId(r.getUserId())
                .userPwd(encoder.encode(r.getUserPwd()))
                .userName(r.getUserName())
                .nickName(r.getNickName())
                .userAge(r.getUserAge())
                .email(r.getEmail())
                .phone(r.getPhone())
                .role("USER")
                .build();
        return repo.save(u);
    }

    public User authenticate(LoginRequest r) {


        var u = repo.findByUserId(r.getUserId()).orElse(null);
        if (u == null) return null;
        return encoder.matches(r.getUserPwd(), u.getUserPwd()) ? u : null;
    }

    public String newAccessToken(User user) {
    return jwt.createAccessToken(user.getUserId(), user.getRole());
    }


    public String newRefreshToken(String userId) {
        return jwt.createRefreshToken(userId);
    }

    

}
