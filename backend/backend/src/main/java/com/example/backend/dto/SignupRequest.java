package com.example.backend.dto;


import lombok.*;


@Getter @Setter
public class SignupRequest {

  private String userId;
  private String nickName;
  private String userPwd;
  private String userName;
  private Integer userAge;
  private String email;
  private String phone;
    
}
