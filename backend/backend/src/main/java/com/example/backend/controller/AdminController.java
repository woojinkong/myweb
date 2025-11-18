package com.example.backend.controller;

import com.example.backend.dto.PointRequest;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.User;
import com.example.backend.repository.BoardRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ActiveUserService;
import com.example.backend.service.BoardService;
import com.example.backend.service.PointService;
import com.example.backend.service.VisitService;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final BoardRepository boardRepository;
    private final VisitService visitService;
    private final BoardService boardService;
    private final ActiveUserService activeUserService;
    private final PointService pointService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    // ✅ 전체 회원 조회
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDTO> dtos = users.stream()
                .map(UserDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(dtos);
    }


    // ✅ 회원 강제 삭제
//    @DeleteMapping("/users/{userId}")
//    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
//        User user = userRepository.findByUserId(userId).orElse(null);
//        if (user == null) return ResponseEntity.notFound().build();
//
//        userRepository.delete(user);
//        return ResponseEntity.ok("회원이 삭제되었습니다: " + userId);
//    }

    // ✅ 권한 변경 (USER ↔ ADMIN)
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateRole(@PathVariable String userId, @RequestParam String role) {
        User user = userRepository.findByUserId(userId).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        user.setRole(role);
        userRepository.save(user);
        return ResponseEntity.ok("권한이 변경되었습니다: " + role);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        long userCountToday = userRepository.countByUserCreateDateAfter(
                LocalDate.now().atStartOfDay());
        long visitCountToday = visitService.countTodayVisits(); // 선택 (없으면 0)
        long totalBoardCount = boardRepository.count();

        Map<String, Long> stats = new HashMap<>();
        stats.put("todayUsers", userCountToday);
        stats.put("todayVisits", visitCountToday);
        stats.put("totalBoards", totalBoardCount);

        return ResponseEntity.ok(stats);
    }

    @DeleteMapping("/boards")
    public ResponseEntity<?> deleteAllBoards() {

        // 서비스에 삭제 맡기기
        boardService.deleteAllBoards();

        // 이미지 삭제
        File folder = new File(uploadDir);
        if (folder.exists() && folder.isDirectory()) {
            for (File file : folder.listFiles()) {
                file.delete();
            }
        }

        return ResponseEntity.ok("전체 게시글 + 이미지 삭제 완료");
    }


    // ✅ 회원 영구 정지
    @PutMapping("/users/{userId}/ban")
    public ResponseEntity<?> banUser(
            @PathVariable String userId,
            @RequestParam String reason
    ) {
        User user = userRepository.findByUserId(userId).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        user.setBanned(true);
        user.setBanReason(reason);
        user.setBannedAt(LocalDateTime.now());

        userRepository.save(user);

        return ResponseEntity.ok("해당 회원이 영구 정지되었습니다.");
    }

    // ✅ 정지 해제
    @PutMapping("/users/{userId}/unban")
    public ResponseEntity<?> unbanUser(@PathVariable String userId) {
        User user = userRepository.findByUserId(userId).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        user.setBanned(false);
        user.setBanReason(null);
        user.setBannedAt(null);

        userRepository.save(user);

        return ResponseEntity.ok("회원 정지가 해제되었습니다.");
    }


    @GetMapping("/active-users")
    public long getActiveUsers() {
        return activeUserService.getActiveUserCount();
    }


    // ⭐ 관리자 권한만 허용
    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/users/{userNo}/points")
    public ResponseEntity<?> givePoints(@PathVariable Long userNo,
                                        @RequestBody PointRequest request) {

        pointService.addPoint(userNo, request.getAmount(), "ADMIN_GIVE");

        return ResponseEntity.ok("포인트 지급 완료");
    }


}
