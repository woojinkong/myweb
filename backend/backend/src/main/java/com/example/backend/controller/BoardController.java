package com.example.backend.controller;

import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.BoardDetailResponse;
import com.example.backend.dto.BoardListResponse;
import com.example.backend.entity.Board;
import com.example.backend.entity.BoardGroup;
import com.example.backend.entity.BoardImage;
import com.example.backend.service.BoardGroupService;
import com.example.backend.service.BoardService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.querydsl.QSort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jsoup.Jsoup;
import org.springframework.web.server.ResponseStatusException;


@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor

public class BoardController {

    private final BoardService boardService;
    private final BoardGroupService boardGroupService;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${file.upload-dir}")
    private String uploadDir;

    /** ===========================================================
     *  📌 (1) 게시판 목록 조회(페이징으로수정)
     * =========================================================== */
    @GetMapping
    public ResponseEntity<Page<BoardListResponse>> getBoards(
            @RequestParam("groupId") Long groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "new") String sort,
            @RequestHeader(value = "X-Board-Password", required = false) String boardPassword,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        // ⭐ 여기에만 로그 5줄 넣으면 됨
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
//        System.out.println("====================");
//        System.out.println("AUTH = " + auth);
//        System.out.println("AUTHORITIES = " + auth.getAuthorities());
//        System.out.println("PRINCIPAL = " + auth.getPrincipal());
//        System.out.println("====================");
        // 로그인 정보
        String role = (userDetails != null)
                ? userDetails.getUser().getRole()
                : "GUEST";

        // adminOnly 게시판 체크
        BoardGroup group = boardGroupService.findById(groupId);
        if (group.isAdminOnly() && !"ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body(null);
        }

        // 🔐 게시판 비밀번호 체크
        checkBoardPassword(group, boardPassword);


        // 🔥 Sort 옵션 매핑
        Sort sortOption = switch (sort) {
            case "likes" -> Sort.by(Sort.Direction.DESC, "likeCount");
            case "old"   -> Sort.by(Sort.Direction.ASC, "createdDate");
            default      -> Sort.by(Sort.Direction.DESC, "createdDate");
        };

        // 🔥 여기서 sortOption 적용해야 함!
        Pageable pageable = PageRequest.of(page, size, sortOption);

        Page<BoardListResponse> result = boardService.findAllByBoardGroup(groupId, pageable);

        return ResponseEntity.ok(result);
    }

    /** ===========================================================
     *  📌 (2) 게시글 상세 조회
     * =========================================================== */
    @GetMapping("/{id}")
    public ResponseEntity<BoardDetailResponse> getBoard(@PathVariable Long id,
                                                        @RequestHeader(value = "X-View-Key", required = false) String viewKey ,
                                                        @RequestHeader(value = "X-Board-Password", required = false) String boardPassword,
                                                        @AuthenticationPrincipal CustomUserDetails userDetails) {
        // 1) 게시글 원본 가져오기
        Board board = boardService.findByIdRaw(id);
        if (board == null) return ResponseEntity.notFound().build();

        // 2) 게시글이 속한 게시판 그룹
        BoardGroup group = board.getBoardGroup();

        // 3) 유저 권한 가져오기 (비로그인 = GUEST)
        String role = (userDetails != null)
                ? userDetails.getUser().getRole()
                : "GUEST";

        // 4) 관리자 전용 게시판이면 일반 유저 차단
        if (group.isAdminOnly() && !"ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).build();
        }

        // 🔐 반드시 추가
        checkBoardPassword(group, boardPassword);

        BoardDetailResponse response = boardService.findByIdForRead(id, viewKey);
        return response != null
                ? ResponseEntity.ok(response)
                : ResponseEntity.notFound().build();
    }

    /** ===========================================================
     *  📌 (3) 게시글 작성 — 이미지 업로드는 TipTap(upload-image)에서 처리
     * =========================================================== */
    @PostMapping(consumes = "multipart/form-data")
    @CacheEvict(value = "sitemap", allEntries = true)
    public ResponseEntity<?> createBoard(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("groupId") Long groupId,
            @RequestHeader(value = "X-Board-Password", required = false) String boardPassword

    ) {

        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        BoardGroup group = boardGroupService.findById(groupId);

        if (group.isAdminOnlyWrite() &&
                !"ADMIN".equalsIgnoreCase(userDetails.getUser().getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("관리자 전용 게시판입니다.");
        }

        // 🔐 게시판 비밀번호 체크 (여기!)
        checkBoardPassword(group, boardPassword);

        Board board = Board.builder()
                .title(title)
                .content(content)
                .plainContent(Jsoup.parse(content).text())  // ← 추가
                .userId(userDetails.getUser().getUserId())
                .pinned(false)
                .boardGroup(group)
                .build();

        Board saved = boardService.save(board);

        // HTML 안에서 이미지 src 추출 → DB 저장
        saveImagesFromContent(saved, content);

        // ⭐ BoardImage 저장을 위해 다시 save() 필요
        boardService.saveWithoutCooldown(saved);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /** ===========================================================
     *  📌 (4) 게시글 수정
     * =========================================================== */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBoard(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("groupId") Long groupId,
            @RequestParam(value = "remainImageIds", required = false) String remainIdsJson,
            @RequestHeader(value = "X-Board-Password", required = false) String boardPassword
    ) {

        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Board existing = boardService.findByIdRaw(id);
        if (existing == null)
            return ResponseEntity.notFound().build();

        BoardGroup originGroup  = existing.getBoardGroup();
        checkBoardPassword(originGroup , boardPassword);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(userDetails.getUser().getRole());
        boolean isWriter = existing.getUserId().equals(userDetails.getUser().getUserId());

        if (!isAdmin && !isWriter)
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("수정 권한이 없습니다.");

        BoardGroup group = boardGroupService.findById(groupId);

        if (!isAdmin && !existing.getBoardGroup().getId().equals(groupId))
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("게시판 이동은 관리자만 가능합니다.");

        if (group.isAdminOnlyWrite() && !isAdmin)
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("관리자 전용 게시판입니다.");

        // -----------------------------
        // 기본 정보 수정
        // -----------------------------
        existing.setTitle(title);
        existing.setContent(content);
        existing.setPlainContent(Jsoup.parse(content).text());
        if (isAdmin) existing.setBoardGroup(group);

        // -----------------------------
        // 유지할 이미지 ID
        // -----------------------------
        //ist<Long> remainIds = parseRemainIds(remainIdsJson);

        // 제거해야 하는 이미지 삭제
        //removeDeletedImages(existing, remainIds);

        // -----------------------------
        // content 내용 기반으로 이미지 재등록
        // -----------------------------
        saveImagesFromContent(existing, content);

        return ResponseEntity.ok(boardService.saveWithoutCooldown(existing));
    }

    /** ===========================================================
     *  📌 (5) 게시글 삭제
     * =========================================================== */
    @DeleteMapping("/{id}")
    @CacheEvict(value = "sitemap", allEntries = true)
    public ResponseEntity<?> deleteBoard(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {

        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Board board = boardService.findByIdRaw(id);
        if (board == null)
            return ResponseEntity.notFound().build();

        boolean isAdmin = "ADMIN".equalsIgnoreCase(userDetails.getUser().getRole());
        boolean isWriter = board.getUserId().equals(userDetails.getUser().getUserId());

        if (!isAdmin && !isWriter)
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("삭제 권한이 없습니다.");

        // 저장된 파일 삭제
        for (BoardImage img : board.getImages()) {
            File f = new File(uploadDir, img.getImagePath().replace("/uploads/", ""));
            if (f.exists()) f.delete();
        }
        // ⭐ DB에서도 BoardImage 제거! (FK 문제 해결)
        board.getImages().clear();

        boardService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** ===========================================================
     *  📌 HTML content 안의 <img src="..."> 분석해서 DB 저장
     * =========================================================== */
    private void saveImagesFromContent(Board board, String html) {

        // 1) 기존 이미지 리스트 초기화 (삭제 여부는 위에서 처리함)
        board.getImages().clear();

        if (html == null) return;

        // 절대경로 + 상대경로 모두 지원하는 정규식
        Pattern p = Pattern.compile(
                "<img[^>]*src=[\"'][^\"']*(/uploads/[^\"']+)[\"']",
                Pattern.CASE_INSENSITIVE
        );



        Matcher m = p.matcher(html);

        while (m.find()) {
            String path = m.group(1);

            System.out.println("📌 DB 저장될 이미지 path = " + path);

            board.getImages().add(
                    BoardImage.builder()
                            .board(board)
                            .imagePath(path)
                            .build()
            );
        }
    }

    /** ===========================================================
     *  📌 remainImageIds JSON → List<Long>
     * =========================================================== */
    private List<Long> parseRemainIds(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();

        try {
            return new ObjectMapper().readValue(json, List.class);
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    /** ===========================================================
     *  📌 기존 이미지 중에서 남기지 않는 이미지 삭제
     * =========================================================== */
    private void removeDeletedImages(Board board, List<Long> remainIds) {

        List<BoardImage> toRemove = new ArrayList<>();

        for (BoardImage img : board.getImages()) {
            if (!remainIds.contains(img.getImageId())) {

                File file = new File(uploadDir, img.getImagePath().replace("/uploads/", ""));
                if (file.exists()) file.delete();

                toRemove.add(img);
            }
        }

        board.getImages().removeAll(toRemove);
    }

    /** ===========================================================
     *  📌 TipTap 전용 이미지 업로드 API
     * =========================================================== */
    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadEditorImage(
            @RequestParam("image") MultipartFile file
    ) throws IOException {

        if (file.isEmpty())
            return ResponseEntity.badRequest().body("EMPTY_FILE");

        // 1) 확장자 검사
        String originalName = file.getOriginalFilename();
        if (originalName == null) {
            return ResponseEntity.badRequest().body("Invalid file.");
        }

        String ext = originalName.substring(originalName.lastIndexOf(".") + 1).toLowerCase();

        List<String> allowedExt = List.of("jpg", "jpeg", "png", "gif", "webp");
        if (!allowedExt.contains(ext)) {
            return ResponseEntity.status(400).body("허용되지 않은 확장자입니다.");
        }

        // 2) 용량 제한
        if (file.getSize() > 20 * 1024 * 1024) {
            return ResponseEntity.status(400).body("파일 크기가 너무 큽니다. (20MB 제한)");
        }


        try{
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            File dest = new File(uploadDir, filename);
            dest.getParentFile().mkdirs();
            file.transferTo(dest);

            Map<String, String> res = new HashMap<>();
            res.put("url", "/uploads/" + filename);
            return ResponseEntity.ok(res);
        }catch(Exception e){
            return ResponseEntity.status(500).body("업로드 실패");
        }

    }


    /** ===========================================================
     *  📌 (6) 게시글 검색 (제목 / 내용 / 작성자)
     * =========================================================== */
    @GetMapping("/search")
    public ResponseEntity<Page<BoardListResponse>> searchBoards(
            @RequestParam String keyword,
            @RequestParam String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        Page<BoardListResponse> result =
                boardService.searchBoards(keyword, type, pageable);

        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/pin")
    public ResponseEntity<?> pinBoard(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id
    ) {
        if (userDetails == null || !"ADMIN".equalsIgnoreCase(userDetails.getUser().getRole()))
            return ResponseEntity.status(403).body("관리자만 가능합니다.");

        boardService.pinBoard(id);
        return ResponseEntity.ok("PINNED");
    }

    @PostMapping("/{id}/unpin")
    public ResponseEntity<?> unpinBoard(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id
    ) {
        if (userDetails == null || !"ADMIN".equalsIgnoreCase(userDetails.getUser().getRole()))
            return ResponseEntity.status(403).body("관리자만 가능합니다.");

        boardService.unpinBoard(id);
        return ResponseEntity.ok("UNPINNED");
    }



    @PostMapping("/{id}/move")
    public ResponseEntity<?> moveBoard(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestParam("targetGroupId") Long targetGroupId
    ) {

        if (userDetails == null || !"ADMIN".equalsIgnoreCase(userDetails.getUser().getRole())) {
            return ResponseEntity.status(403).body("관리자만 게시판 이동이 가능합니다.");
        }

        Board board = boardService.findByIdRaw(id);
        if (board == null) return ResponseEntity.notFound().build();

        BoardGroup group = boardGroupService.findById(targetGroupId);

        board.setBoardGroup(group);
        boardService.saveWithoutCooldown(board);

        return ResponseEntity.ok("게시판 이동 완료");
    }

    private void checkBoardPassword(
            BoardGroup group,
            String passwordHeader
    ) {
        if (!group.isPasswordEnabled()) {
            return; // 통과
        }

        if (passwordHeader == null || passwordHeader.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "BOARD_PASSWORD_REQUIRED"
            );
        }

        if (!passwordEncoder.matches(passwordHeader, group.getPasswordHash())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "BOARD_PASSWORD_INVALID"
            );
        }
    }





}
