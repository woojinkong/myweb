package com.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContactRequest {
    private String email;   // 사용자 이메일
    private String subject; // 제목
    private String message; // 내용
}
