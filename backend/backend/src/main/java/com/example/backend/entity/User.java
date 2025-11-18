package com.example.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Builder @Table(name = "user")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userNo;

    @Column(nullable = false, unique=true)
    private String userId;
    @Column(nullable = false)
    private String userPwd;
    @Column(nullable = false)
    private String userName;

    private Integer userAge;
    private String email;
    private String phone;
    private String role = "USER";

     // ✅ 프로필 이미지 경로 추가
    private String profileImage;

    // ✅ 가입일자 필드 추가
    @Column(name = "user_create_date", updatable = false)
    private LocalDateTime userCreateDate;

    // ✅ 회원 생성 시 자동으로 등록일 저장
    @PrePersist
    public void onCreate() {
        this.userCreateDate = LocalDateTime.now();
    }


    @Column(nullable = false)
    private boolean banned = false;  // 정지 여부

    private String banReason;        // 정지 사유
    private LocalDateTime bannedAt;  // 정지 날짜


    //point기능
    @Column(nullable = false)
    private int point = 0;


}
