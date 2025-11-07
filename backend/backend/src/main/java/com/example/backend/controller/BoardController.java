package com.example.backend.controller;

import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.BoardListResponse;
import com.example.backend.dto.BoardDetailResponse;
import com.example.backend.entity.Board;
import com.example.backend.entity.BoardImage;
import com.example.backend.service.BoardService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
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
    @GetMapping
    public ResponseEntity<List<BoardListResponse>> getAll(
            @RequestParam(required = false) String category) {
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(service.findAllWithCommentCountByCategory(category));
        } else {
            return ResponseEntity.ok(service.findAllWithCommentCount());
        }
    }

    // ✅ 단일 게시글 조회 (프로필 포함)
    @GetMapping("/{id}")
    public ResponseEntity<BoardDetailResponse> getOne(@PathVariable Long id) {
        BoardDetailResponse board = service.findByIdForRead(id);
        return board != null ? ResponseEntity.ok(board) : ResponseEntity.notFound().build();
    }

    // ✅ 게시글 생성
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Board> create(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam("category") String category
    ) throws IOException {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userId = userDetails.getUser().getUserId();

        Board board = Board.builder()
                .title(title)
                .content(content)
                .userId(userId)
                .category(category)
                .build();

        Board savedBoard = service.save(board);

        // ✅ 이미지 업로드 처리
        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                if (!image.isEmpty()) {
                    String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
                    File dest = new File(uploadDir, fileName);
                    dest.getParentFile().mkdirs();
                    image.transferTo(dest);

                    String filePath = "/uploads/" + fileName;

                    BoardImage boardImage = BoardImage.builder()
                            .board(savedBoard)
                            .imagePath(filePath)
                            .build();
                    savedBoard.getImages().add(boardImage);
                }
            }
            savedBoard = service.save(savedBoard);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(savedBoard);
    }

    // ✅ 게시글 수정
    @PutMapping("/{id}")
    public ResponseEntity<Board> update(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "remainImageIds", required = false) String remainImageIdsJson
    ) throws IOException {

        Board existing = service.findByIdRaw(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        existing.setTitle(title);
        existing.setContent(content);
        if (category != null && !category.isBlank()) {
            existing.setCategory(category);
        }

        List<Long> remainIds = new ArrayList<>();
        if (remainImageIdsJson != null && !remainImageIdsJson.isBlank()) {
            ObjectMapper mapper = new ObjectMapper();
            remainIds = mapper.readValue(
                    remainImageIdsJson,
                    mapper.getTypeFactory().constructCollectionType(List.class, Long.class)
            );
        }

        // ✅ 기존 이미지 삭제
        if (existing.getImages() != null) {
            List<BoardImage> toRemove = new ArrayList<>();
            for (BoardImage img : existing.getImages()) {
                if (img.getImageId() != null && !remainIds.contains(img.getImageId())) {
                    if (img.getImagePath() != null) {
                        File oldFile = new File(uploadDir, img.getImagePath().replace("/uploads/", ""));
                        if (oldFile.exists()) oldFile.delete();
                    }
                    toRemove.add(img);
                }
            }
            existing.getImages().removeAll(toRemove);
        }

        // ✅ 새 이미지 추가
        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                if (!image.isEmpty()) {
                    String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
                    File dest = new File(uploadDir, fileName);
                    dest.getParentFile().mkdirs();
                    image.transferTo(dest);

                    String filePath = "/uploads/" + fileName;

                    BoardImage boardImage = BoardImage.builder()
                            .board(existing)
                            .imagePath(filePath)
                            .build();
                    existing.getImages().add(boardImage);
                }
            }
        }

        return ResponseEntity.ok(service.save(existing));
    }

    // ✅ 게시글 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Board existing = service.findByIdRaw(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        if (existing.getImages() != null) {
            for (BoardImage img : existing.getImages()) {
                if (img.getImagePath() != null) {
                    File oldFile = new File(uploadDir, img.getImagePath().replace("/uploads/", ""));
                    if (oldFile.exists()) oldFile.delete();
                }
            }
        }

        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ 게시글 검색
    @GetMapping("/search")
    public ResponseEntity<List<BoardListResponse>> searchBoards(
            @RequestParam("keyword") String keyword,
            @RequestParam("type") String type
    ) {
        List<BoardListResponse> results = service.searchBoards(keyword, type);
        return ResponseEntity.ok(results);
    }
}
