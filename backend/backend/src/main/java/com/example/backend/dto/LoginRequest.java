package com.example.backend.dto;
import lombok.*;

@Getter
@Setter
public class LoginRequest {
     private String userId;
     private String userPwd;
}
