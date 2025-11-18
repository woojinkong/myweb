package com.example.backend.service;

import com.example.backend.dto.BoardListResponse;
import com.example.backend.dto.BoardDetailResponse;
import com.example.backend.entity.Board;
import com.example.backend.entity.User;
import com.example.backend.repository.BoardRepository;
import com.example.backend.repository.CommentRepository;
import com.example.backend.repository.ReportRepository;
import com.example.backend.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
    //   📌 특정 게시판(BoardGroup) 기준 목록 조회
    // ===============================================================
    public List<BoardListResponse> findAllByBoardGroup(Long groupId) {

        List<Board> boards = boardRepository
                .findByBoardGroupIdOrderByCreatedDateDesc(groupId);

        return boards.stream()
                .map(this::toListDto)
                .toList();
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
    public List<BoardListResponse> searchBoards(String keyword, String type) {

        List<Board> boards = switch (type) {
            case "title" -> boardRepository.findByTitleContainingIgnoreCase(keyword);
            case "content" -> boardRepository.findByContentContainingIgnoreCase(keyword);
            case "userId" -> boardRepository.findByUserIdContainingIgnoreCase(keyword);
            default -> List.of();
        };

        return boards.stream()
                .map(this::toListDto)
                .toList();
    }

    // ===============================================================
    //   📌 Board → BoardListResponse 변환 (공통 변환 메서드)
    // ===============================================================
    private BoardListResponse toListDto(Board board) {

        return BoardListResponse.builder()
                .boardNo(board.getBoardNo())
                .title(board.getTitle())
                .userId(board.getUserId())
                .viewCount(board.getViewCount())
                .createdDate(board.getCreatedDate())
                .commentCount(commentRepository.countByBoard(board))
                .imagePath(getFirstImage(board))
                .groupId(board.getBoardGroup().getId())
                .groupName(board.getBoardGroup().getName())
                .profileUrl(getProfileUrl(board.getUserId()))
                .build();
    }

    // ===============================================================
    //   📌 Board → BoardDetailResponse 변환
    // ===============================================================
    private BoardDetailResponse toDetailDto(Board board) {

        return BoardDetailResponse.builder()
                .boardNo(board.getBoardNo())
                .title(board.getTitle())
                .content(board.getContent())
                .userId(board.getUserId())
                .createdDate(board.getCreatedDate())
                .viewCount(board.getViewCount())
                .groupId(board.getBoardGroup().getId())
                .groupName(board.getBoardGroup().getName())
                .images(board.getImages())
                .profileUrl(getProfileUrl(board.getUserId()))
                .allowComment(board.getBoardGroup().isAllowComment())

                .build();
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
        Optional<User> opt = userRepository.findByUserId(userId);
        if (opt.isEmpty()) return null;

        String img = opt.get().getProfileImage();
        if (img == null || img.isBlank()) return null;

        return img.startsWith("/uploads/") ? img : "/uploads/" + img;
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
    public Board save(Board board) {
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


}
