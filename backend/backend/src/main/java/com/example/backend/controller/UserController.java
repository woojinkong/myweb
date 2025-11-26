package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.UserService;
import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.UserDTO;
import org.springframework.beans.factory.annotation.Value;
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
    private final UserRepository userRepository;
    @Value("${file.upload-dir}")
    private String baseUploadDir;
    // ✅ 내 정보 조회
@GetMapping("/myinfo")
public ResponseEntity<UserDTO> getMyInfo(@AuthenticationPrincipal CustomUserDetails userDetails) {
    if (userDetails == null || userDetails.getUser() == null)
        return ResponseEntity.status(401).build();

    User user = userService.findById(userDetails.getUser().getUserNo());
    return ResponseEntity.ok(UserDTO.fromEntity(user)); // ✅ DTO로 변환해서 반환
}

// ✅ 내 정보 수정
@PutMapping("/update")
public ResponseEntity<UserDTO> updateMyInfo(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @RequestBody User updatedInfo
) {
    if (userDetails == null) return ResponseEntity.status(401).build();
    User updated = userService.updateUserInfo(userDetails.getUser().getUserNo(), updatedInfo);
    return ResponseEntity.ok(UserDTO.fromEntity(updated)); // ✅ 반환도 DTO
}


    // ✅ 프로필 이미지 업로드
    @PostMapping(value = "/profile", consumes = {"multipart/form-data"})
    public ResponseEntity<String> uploadProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("image") MultipartFile image
    ) throws IOException {
        if (userDetails == null) return ResponseEntity.status(401).build();

        String uploadDir = baseUploadDir + "/profile/";
        
   
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


    // ✅ 특정 유저 정보 조회 (userId 기준)
    @GetMapping("/info/{userId}")
    public ResponseEntity<UserDTO> getUserInfo(@PathVariable String userId) {
        User user = userService.findByUserId(userId);
        if (user == null) {
            return ResponseEntity.notFound().build(); // 404 반환
        }
    return ResponseEntity.ok(UserDTO.fromEntity(user));
    }

    @GetMapping("/check-nickName")
    public ResponseEntity<?> checkNickName(@RequestParam String nickName) {
        boolean exists = userRepository.existsByNickName(nickName);
        return ResponseEntity.ok(Map.of("exists", exists));
    }


}
