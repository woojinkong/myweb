package com.example.backend.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    // 임시 인증코드 저장소 (실서비스는 Redis 권장)
    private final Map<String, String> verificationCodes = new HashMap<>();

    // ✅ HTML 이메일 전송
    public void sendVerificationCode(String email) {
        String code = generateCode();
        verificationCodes.put(email, code);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("[KongHome] 이메일 인증 코드");

            String htmlContent = """
                <div style="font-family: 'Pretendard', 'Arial', sans-serif; max-width: 480px; margin: 20px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fafafa;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #007bff; margin-bottom: 8px;">KongHome</h2>
                        <p style="color: #555; font-size: 15px;">이메일 인증을 완료해주세요</p>
                    </div>

                    <div style="background-color: #fff; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #ddd;">
                        <p style="font-size: 16px; color: #333;">아래의 인증번호를 KongHome 페이지에 입력해주세요.</p>
                        <div style="margin: 18px 0; font-size: 28px; font-weight: bold; color: #007bff; letter-spacing: 4px;">
                            %s
                        </div>
                    </div>

                    <div style="text-align: center; margin-top: 25px; font-size: 13px; color: #999;">
                        본 메일은 KongHome 회원가입을 위해 발송되었습니다.<br/>
                        문의: <a href="mailto:dodejqn6@naver.com" style="color: #007bff; text-decoration: none;">dodejqn6@naver.com</a>
                    </div>
                </div>
            """.formatted(code);

            helper.setText(htmlContent, true); // ✅ HTML 본문 설정
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("이메일 전송 중 오류 발생", e);
        }
    }

    // ✅ 인증코드 검증
    public boolean verifyCode(String email, String code) {
        String stored = verificationCodes.get(email);
        if (stored != null && stored.equals(code)) {
            verificationCodes.remove(email); // ✅ 일회용
            return true;
        }
        return false;
    }

    // ✅ 6자리 랜덤 코드 생성
    private String generateCode() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 6; i++) sb.append(random.nextInt(10));
        return sb.toString();
    }
}
