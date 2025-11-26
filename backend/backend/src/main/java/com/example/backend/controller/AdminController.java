package com.example.backend.controller;

import com.example.backend.dto.PointRequest;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.BlockedIp;
import com.example.backend.entity.Board;
import com.example.backend.entity.User;
import com.example.backend.repository.BoardRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.*;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final BlockedIpService blockedIpService;

    @Value("${file.upload-dir}")
    private String uploadDir;



    // ✅ 전체 회원 조회
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<User> result = userRepository.findAll(pageable);

        List<UserDTO> users = result.getContent()
                .stream()
                .map(UserDTO::fromEntity)
                .toList();

        Map<String, Object> response = new HashMap<>();
        response.put("users", users);
        response.put("currentPage", result.getNumber());
        response.put("totalPages", result.getTotalPages());
        response.put("totalItems", result.getTotalElements());
        return ResponseEntity.ok(response);
    }


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


    // ================================
    // 📌 관리자 → 특정 유저에게 이메일 보내기
    // ================================
    @PostMapping("/email/send/{userId}")
    public ResponseEntity<?> sendEmailToUser(
            @PathVariable String userId,
            @RequestBody Map<String, String> req
    ) {

        String subject = req.get("subject");
        String message = req.get("message");

        var user = userRepository.findByUserId(userId)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("success", false, "message", "해당 유저를 찾을 수 없습니다."));
        }

        emailService.sendCustomEmail(user.getEmail(), subject, message);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "이메일이 정상적으로 발송되었습니다."
        ));
    }

    // ================================
    // 📌 관리자 → 전체 유저에게 이메일 보내기
    // ================================
    @PostMapping("/email/send-all")
    public ResponseEntity<?> sendEmailToAllUsers(@RequestBody Map<String, String> req) {

        String subject = req.get("subject");
        String message = req.get("message");

        var users = userRepository.findAll();

        for (User u : users) {
            if (u.getEmail() != null) {
                emailService.sendCustomEmail(u.getEmail(), subject, message);
            }
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "전체 유저에게 이메일이 전송되었습니다."
        ));
    }



    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/board/delete/{boardNo}")
    public ResponseEntity<?> adminDeleteBoard(
            @PathVariable Long boardNo,
            @RequestBody Map<String, String> req
    ) {
        String reason = req.get("reason");
        if (reason == null || reason.isBlank()) {
            return ResponseEntity.badRequest().body("삭제 사유가 필요합니다.");
        }

        // 게시글 조회
        Board board = boardService.findByIdRaw(boardNo);
        if (board == null) {
            return ResponseEntity.status(404).body("게시글을 찾을 수 없습니다.");
        }

        // 작성자 정보 가져오기
        Optional<User> writerOpt = userRepository.findByUserId(board.getUserId());
        if (writerOpt.isEmpty()) {
            return ResponseEntity.status(404).body("작성자를 찾을 수 없습니다.");
        }

        Long writerUserNo = writerOpt.get().getUserNo();

        // 게시글 삭제
        boardService.delete(boardNo);

        // 알림 발송
        notificationService.send(
                writerUserNo,
                "관리자가 '" + reason + "' 사유로 게시글을 삭제했습니다.",
                "/board/" + boardNo
        );

        return ResponseEntity.ok("게시글이 삭제되었습니다.");
    }


    /* ============================================================
       🔥 IP 차단 관리
    ============================================================ */

    // 1. 전체 차단 IP 조회
    @GetMapping("/ip-block/list")
    public ResponseEntity<?> getBlockedIpList() {
        return ResponseEntity.ok(blockedIpService.getAll());
    }

    // 2. IP 차단
    @PostMapping("/ip-block/block")
    public ResponseEntity<?> blockIp(@RequestBody Map<String, String> req) {
        String ip = req.get("ip");
        String reason = req.get("reason");

        if (ip == null || ip.isBlank()) {
            return ResponseEntity.badRequest().body("IP를 입력해주세요.");
        }

        BlockedIp result = blockedIpService.blockIp(ip, reason);
        return ResponseEntity.ok(result);
    }

    // 3. 차단 해제
    @DeleteMapping("/ip-block/unblock/{id}")
    public ResponseEntity<?> unblockIp(@PathVariable Long id) {
        blockedIpService.unblockIp(id);
        return ResponseEntity.ok("차단이 해제되었습니다.");
    }




}
