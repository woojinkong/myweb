package com.example.backend.controller;

import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.BoardListResponse;
import com.example.backend.entity.Board;
import com.example.backend.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService service;

    @Value("${file.upload-dir}")
    private String uploadDir;

    // ✅ 전체 게시글 조회
   // ✅ BoardController.java
    @GetMapping
        public ResponseEntity<List<BoardListResponse>> getAll(
            @RequestParam(required = false) String category
        ) {
        if (category != null && !category.isBlank()) {
            // ✅ 카테고리별 조회
            return ResponseEntity.ok(service.findAllWithCommentCountByCategory(category));
        } else {
            // ✅ 전체 조회
            return ResponseEntity.ok(service.findAllWithCommentCount());
        }
        }


    // ✅ 단일 게시글 조회
    @GetMapping("/{id}")
    public ResponseEntity<Board> getOne(@PathVariable Long id) {
    Board board = service.findByIdForRead(id);
    return board != null ? ResponseEntity.ok(board) : ResponseEntity.notFound().build();
}


    // ✅ 게시글 + 이미지 업로드
   @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Board> create(
        @AuthenticationPrincipal CustomUserDetails userDetails, // ✅ 로그인 유저 자동 주입
        @RequestParam("title") String title,
        @RequestParam("content") String content,
        @RequestParam(value = "image", required = false) MultipartFile image,
        @RequestParam("category") String category   // ✅ 추가
    ) throws IOException {

    if (userDetails == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    String userId = userDetails.getUser().getUserId(); // ✅ 인증된 유저 ID 사용
    String filePath = null;

    if (image != null && !image.isEmpty()) {
        String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
        File dest = new File(uploadDir, fileName);
        dest.getParentFile().mkdirs();
        image.transferTo(dest);
        filePath = "/uploads/" + fileName;
    }

    Board board = Board.builder()
            .title(title)
            .content(content)
            .userId(userId) // ✅ 인증된 유저 ID로 설정
            .imagePath(filePath)
            .category(category) // ✅ 필수
            .build();

    return ResponseEntity.status(HttpStatus.CREATED).body(service.save(board));
}



    // ✅ 게시글 수정
    @PutMapping("/{id}")
    public ResponseEntity<Board> update(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "category", required = false) String category // ✅ 선택적으로 변경 가능
    ) throws IOException {

        Board existing = service.findByIdRaw(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        String filePath = existing.getImagePath();

        if (image != null && !image.isEmpty()) {
            // ✅ 기존 이미지 삭제
            if (existing.getImagePath() != null) {
                File oldFile = new File(uploadDir, existing.getImagePath().replace("/uploads/", ""));
                if (oldFile.exists()) oldFile.delete();
            }

            // ✅ 새 이미지 업로드
            String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
            File dest = new File(uploadDir, fileName);
            dest.getParentFile().mkdirs();
            image.transferTo(dest);
            filePath = "/uploads/" + fileName;
        }

        existing.setTitle(title);
        existing.setContent(content);
        existing.setImagePath(filePath);
        if (category != null && !category.isBlank()) {
        existing.setCategory(category);
}
        return ResponseEntity.ok(service.save(existing));
    }

    // ✅ 게시글 삭제
   @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
    Board existing = service.findByIdRaw(id);  // ✅ 조회수 증가 안함
    if (existing == null) {
        return ResponseEntity.notFound().build();
    }

    if (existing.getImagePath() != null) {
        File oldFile = new File(uploadDir, existing.getImagePath().replace("/uploads/", ""));
        if (oldFile.exists()) oldFile.delete();
    }

    service.delete(id);
    return ResponseEntity.noContent().build();
}


    

}
