package com.example.backend.dto;
import lombok.*;
import com.example.backend.entity.User;


@Getter @Setter @AllArgsConstructor
public class AuthResponse {
  private String accessToken;
  private User user;
    
}
