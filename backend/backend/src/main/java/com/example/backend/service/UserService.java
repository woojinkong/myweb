package com.example.backend.service;

import com.example.backend.entity.PasswordResetToken;
import com.example.backend.entity.User;
import com.example.backend.repository.PasswordResetTokenRepository;
import com.example.backend.repository.UserRepository;

import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender; // ✅ 메일 전송용
    @Value("${konghome.frontend-url}")
    private String frontendUrl;


    @PostConstruct
    public void initAdmin() {
        if (userRepository.findByUserId("admin").isEmpty()) {
            User admin = new User();
            admin.setUserId("admin");
            admin.setUserPwd(passwordEncoder.encode("dnwls2247!"));
            admin.setRole("ADMIN");
            admin.setUserName("관리자");
            admin.setNickName("관리자");
            userRepository.save(admin);
        }
    }


    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public void updateProfileImage(Long userNo, String imagePath) {
        Optional<User> optionalUser = userRepository.findById(userNo);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setProfileImage(imagePath);
            userRepository.save(user);
        }
    }

    public User updateUserInfo(Long userNo, User updatedInfo) {
    return userRepository.findById(userNo).map(user -> {
        if (updatedInfo.getNickName() != null)
            user.setNickName(updatedInfo.getNickName());   // ★★ 닉네임 업데이트 추가!!
        if (updatedInfo.getUserName() != null) user.setUserName(updatedInfo.getUserName());
        if (updatedInfo.getEmail() != null) user.setEmail(updatedInfo.getEmail());
        if (updatedInfo.getPhone() != null) user.setPhone(updatedInfo.getPhone());
        return userRepository.save(user);
    }).orElseThrow(() -> new RuntimeException("User not found"));
    }


        @Transactional
    public void sendPasswordResetLink(String userId, String userName, String email) {
        User user = userRepository.findByUserIdAndUserNameAndEmail(userId, userName, email)
                .orElseThrow(() -> new RuntimeException("일치하는 회원이 없습니다."));

        // 기존 토큰 존재 시 재사용
        PasswordResetToken resetToken = tokenRepository.findByUser(user)
                .orElse(PasswordResetToken.builder()
                        .user(user)
                        .build());

        resetToken.setToken(UUID.randomUUID().toString());
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(30));

        tokenRepository.save(resetToken); // 새로 저장 또는 덮어쓰기

        // 메일 전송
        String resetUrl = frontendUrl + "/reset-password?token=" + resetToken.getToken();

        sendEmail(email, "[KONGHOME] 비밀번호 재설정 안내",
                "안녕하세요, " + userName + "님.\n\n" +
                        "아래 링크를 클릭하여 비밀번호를 재설정하세요.\n" +
                        resetUrl + "\n\n" +
                        "본 링크는 30분 후 만료됩니다.");
    }


    // ✅ 실제 메일 전송
    private void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    // ✅ 새 비밀번호 저장
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("유효하지 않은 링크입니다."));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("토큰이 만료되었습니다.");
        }

        User user = resetToken.getUser();
        user.setUserPwd(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.delete(resetToken);
    }


    // ✅ 특정 userId로 유저 조회
    public User findByUserId(String userId) {
    return userRepository.findByUserId(userId).orElse(null);
}


    public boolean checkNicknameExists(String nickname) {
        return userRepository.existsByNickName(nickname);
    }


}
