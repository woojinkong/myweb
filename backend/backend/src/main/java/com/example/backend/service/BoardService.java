package com.example.backend.service;

import com.example.backend.dto.BoardListResponse;
import com.example.backend.dto.BoardDetailResponse;
import com.example.backend.entity.Board;
import com.example.backend.entity.User;
import com.example.backend.exception.CustomException;
import com.example.backend.repository.BoardRepository;
import com.example.backend.repository.CommentRepository;
import com.example.backend.repository.ReportRepository;
import com.example.backend.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;

    // ===============================================================
    //   📌 전체 게시글 조회 (관리자용 / 테스트용)
    // ===============================================================
    public List<BoardListResponse> findAllWithCommentCount() {
        List<Board> boards = boardRepository.findAll(
                Sort.by(Sort.Direction.DESC, "boardNo")
        );

        return boards.stream()
                .map(this::toListDto)
                .toList();
    }

    // ===============================================================
    //   📌 특정 게시판(BoardGroup) 기준 목록 조회(페이징수정)
    // ===============================================================
    // ===============================================================
//   📌 특정 게시판(BoardGroup) 기준 목록 조회(페이징 + 상단고정)
// ===============================================================
    public Page<BoardListResponse> findAllByBoardGroup(Long groupId, Pageable pageable) {

        // 1) pinned = true (상단 고정글) — 페이징 없음
        List<Board> pinnedList = boardRepository
                .findByBoardGroupIdAndPinnedTrueOrderByCreatedDateDesc(groupId);

        // 2) pinned = false (일반글) — 페이징
        Page<Board> normalPage = boardRepository
                .findByBoardGroupIdAndPinnedFalse(groupId, pageable);

        // 3) Page 객체가 pinned 글은 포함할 수 없으므로
        //    프론트는 pinnedList + normalPage.content 를 합쳐서 표시하면 됨
        //    대신 응답 구성은 normalPage 정보로 유지
        List<BoardListResponse> pinnedDtoList = pinnedList.stream()
                .map(this::toListDto)
                .toList();

        List<BoardListResponse> normalDtoList = normalPage
                .map(this::toListDto)
                .toList();

        // 4) DTO 합치기
        List<BoardListResponse> merged = new java.util.ArrayList<>();
        merged.addAll(pinnedDtoList);
        merged.addAll(normalDtoList);

        // 5) Page 형태로 다시 묶어서 반환
        return new org.springframework.data.domain.PageImpl<>(
                merged,
                pageable,
                normalPage.getTotalElements() + pinnedList.size() // 총 개수 = pinned + normal
        );
    }

    // ===============================================================
// 📌 게시글 상단 고정
// ===============================================================
    @Transactional
    public void pinBoard(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글 없음"));
        board.setPinned(true);
        boardRepository.save(board);
    }

    // ===============================================================
// 📌 게시글 고정 해제
// ===============================================================
    @Transactional
    public void unpinBoard(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글 없음"));
        board.setPinned(false);
        boardRepository.save(board);
    }


    // ===============================================================
    //   📌 게시글 상세 조회 — 조회수 증가 포함
    // ===============================================================
    public BoardDetailResponse findByIdForRead(Long id) {

        Board board = boardRepository.findById(id).orElse(null);
        if (board == null) return null;

        increaseViewCount(board);

        return toDetailDto(board);
    }

    // 조회수 증가
    private void increaseViewCount(Board board) {
        board.setViewCount(board.getViewCount() + 1);
        boardRepository.save(board);
    }

    // ===============================================================
    //   📌 검색 기능
    // ===============================================================
    public Page<BoardListResponse> searchBoards(String keyword, String type, Pageable pageable) {

        Page<Board> boards = switch (type) {
            case "title" -> boardRepository.findByTitleContainingIgnoreCase(keyword, pageable);
            case "content", "plain" -> boardRepository.findByPlainContentContainingIgnoreCase(keyword,pageable);
            //case "userId" -> boardRepository.findByUserIdContainingIgnoreCase(keyword,pageable);
            //기존 아이디기준검색에서 닉네임기준검색으로 변경
            case "userId" -> boardRepository.findByUserNickNameContainingIgnoreCase(keyword, pageable);


            default -> Page.empty();
        };

        return boards.map(this::toListDto);
    }

    // ===============================================================
    //   📌 Board → BoardListResponse 변환 (공통 변환 메서드)
    // ===============================================================
    private BoardListResponse toListDto(Board board) {

        try{
            User user = userRepository.findByUserId(board.getUserId()).orElse(null);
            Long groupId = board.getBoardGroup() != null ? board.getBoardGroup().getId() : null;
            String groupName = board.getBoardGroup() != null ? board.getBoardGroup().getName() : "";
            return BoardListResponse.builder()
                    .boardNo(board.getBoardNo())
                    .title(board.getTitle())
                    .userId(board.getUserId())
                    .nickName(user != null ? user.getNickName() : board.getUserId())   // <<< 추가
                    .viewCount(board.getViewCount())
                    .createdDate(board.getCreatedDate())
                    .commentCount(commentRepository.countByBoard(board))
                    .imagePath(getFirstImage(board))
                    .groupId(groupId)
                    .groupName(groupName)
                    .profileUrl(getProfileUrl(board.getUserId()))
                    .likeCount(board.getLikeCount())
                    .pinned(board.isPinned())// ⭐ 추가된 부분
                    .build();
        }catch( Exception e){
            return null;
        }

    }

    // ===============================================================
    //   📌 Board → BoardDetailResponse 변환
    // ===============================================================
    private BoardDetailResponse toDetailDto(Board board) {

        try{
            User user = userRepository.findByUserId(board.getUserId()).orElse(null);
            Long groupId = board.getBoardGroup() != null ? board.getBoardGroup().getId() : null;
            String groupName = board.getBoardGroup() != null ? board.getBoardGroup().getName() : "";
            boolean allowComment = board.getBoardGroup() != null && board.getBoardGroup().isAllowComment();
            return BoardDetailResponse.builder()
                    .boardNo(board.getBoardNo())
                    .title(board.getTitle())
                    .content(board.getContent())
                    .userId(board.getUserId())
                    .nickName(user != null ? user.getNickName() : board.getUserId())  // <<< 추가
                    .createdDate(board.getCreatedDate())
                    .viewCount(board.getViewCount())
                    .groupId(groupId)
                    .groupName(groupName)
                    .images(board.getImages())
                    .profileUrl(getProfileUrl(board.getUserId()))
                    .allowComment(allowComment)
                    .pinned(board.isPinned())
                    .build();
        }catch(Exception e){
            return null;
        }


    }

    // ===============================================================
    //   📌 이미지 경로 추출
    // ===============================================================
    private String getFirstImage(Board board) {
        if (board.getImages() == null || board.getImages().isEmpty()) {
            return null;
        }
        return board.getImages().get(0).getImagePath();
    }

    // ===============================================================
    //   📌 유저 프로필 이미지 URL 변환
    // ===============================================================
    private String getProfileUrl(String userId) {
        try {
            Optional<User> opt = userRepository.findByUserId(userId);
            if (opt.isEmpty()) return null;

            String img = opt.get().getProfileImage();
            if (img == null || img.isBlank()) return null;

            return img.startsWith("/uploads/") ? img : "/uploads/" + img;

        } catch (Exception e) {
            return null; // 예외를 401로 넘기지 않음
        }
    }

    // ===============================================================
    //   📌 단순 조회 (조회수 증가 X)
    // ===============================================================
    public Board findByIdRaw(Long id) {
        return boardRepository.findById(id).orElse(null);
    }

    // ===============================================================
    //   📌 저장 / 삭제
    // ===============================================================
    @Transactional
    public Board save(Board board) {

        String userId = board.getUserId();

        // 🔍 최근 작성 1개 가져오기 (LIMIT 1 효과)
        List<LocalDateTime> times =
                boardRepository.findRecentPostTimes(userId, PageRequest.of(0, 1));

        LocalDateTime last = times.isEmpty() ? null : times.get(0);

        // ⏱️ 쿨타임 체크 (10초)
        if (last != null) {
            long seconds = Duration.between(last, LocalDateTime.now()).getSeconds();

            if (seconds < 10) {
                throw new CustomException(
                        "게시글은 10초에 1번만 작성할 수 있습니다. (" + (10 - seconds) + "초 후 재작성 가능)",
                        429    // Too Many Requests
                );
            }
        }

        // 🔥 정상 저장
        return boardRepository.save(board);
    }


    @Transactional
    public void delete(Long id) {
        // 1) 해당 게시글을 참조하는 신고 먼저 삭제
        reportRepository.deleteByBoard_BoardNo(id);
        boardRepository.deleteById(id);
    }




    public void deleteAllBoards() {
        boardRepository.deleteAll();
    }


    @Transactional
    public Board saveWithoutCooldown(Board board) {
        return boardRepository.save(board);
    }



}
