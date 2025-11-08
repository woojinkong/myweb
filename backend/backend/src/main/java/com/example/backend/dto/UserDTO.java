package com.example.backend.dto;

import com.example.backend.entity.User;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDTO {
    private Long userNo;
    private String userId;
    private String userName;
    private String email;
    private String phone;
    private String role;
    private String profileImage;

    public static UserDTO fromEntity(User user) {
        // ✅ DB에 저장된 경로 그대로 사용 (ex: /uploads/profile/xxx.png)
        return UserDTO.builder()
                .userNo(user.getUserNo())
                .userId(user.getUserId())
                .userName(user.getUserName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .profileImage(user.getProfileImage()) // 백엔드에서 /uploads/... 경로로 저장됨
                .build();
    }
}
