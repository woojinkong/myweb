package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.service.UserService;
import com.example.backend.config.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ✅ 내 정보 조회
    @GetMapping("/myinfo")
    public ResponseEntity<User> getMyInfo(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userService.findById(userDetails.getUser().getUserNo());
        return ResponseEntity.ok(user);
    }

    // ✅ 내 정보 수정 (이름, 이메일, 전화번호 등)
    @PutMapping("/update")
    public ResponseEntity<User> updateMyInfo(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody User updatedInfo
    ) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User updated = userService.updateUserInfo(userDetails.getUser().getUserNo(), updatedInfo);
        return ResponseEntity.ok(updated);
    }

    // ✅ 프로필 이미지 업로드
    @PostMapping(value = "/profile", consumes = {"multipart/form-data"})
    public ResponseEntity<String> uploadProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("image") MultipartFile image
    ) throws IOException {
        if (userDetails == null) return ResponseEntity.status(401).build();

        String uploadDir = "C:/myweb/backend/backend/uploads/profile/";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
        File dest = new File(uploadDir + fileName);
        image.transferTo(dest);

        String imagePath = "/uploads/profile/" + fileName;

        userService.updateProfileImage(userDetails.getUser().getUserNo(), imagePath);
        return ResponseEntity.ok("프로필 이미지가 성공적으로 업데이트되었습니다.");
    }


    @PostMapping("/find-password")
    public ResponseEntity<String> findPassword(@RequestBody Map<String, String> request) {
        try {
            userService.sendPasswordResetLink(
                    request.get("userId"),
                    request.get("userName"),
                    request.get("email")
            );
            return ResponseEntity.ok("비밀번호 재설정 링크가 이메일로 발송되었습니다.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) {
        try {
            userService.resetPassword(request.get("token"), request.get("newPassword"));
            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
