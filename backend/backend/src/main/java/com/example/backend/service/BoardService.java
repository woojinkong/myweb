package com.example.backend.service;

import com.example.backend.dto.BoardListResponse;
import com.example.backend.dto.BoardDetailResponse;
import com.example.backend.entity.Board;
import com.example.backend.entity.User;
import com.example.backend.repository.BoardRepository;
import com.example.backend.repository.CommentRepository;
import com.example.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository; // ✅ 추가

    // ✅ 전체 게시글 조회 + 댓글 수 + 프로필 이미지
    public List<BoardListResponse> findAllWithCommentCount() {
        List<Board> boards = boardRepository.findAll(Sort.by(Sort.Direction.DESC, "boardNo"));

        return boards.stream()
                .map(board -> {
                    String profileUrl = getProfileUrl(board.getUserId());
                    return BoardListResponse.builder()
                            .boardNo(board.getBoardNo())
                            .title(board.getTitle())
                            .userId(board.getUserId())
                            .viewCount(board.getViewCount())
                            .createdDate(board.getCreatedDate())
                            .commentCount(commentRepository.countByBoard(board))
                            .imagePath(
                                    (board.getImages() != null && !board.getImages().isEmpty())
                                            ? board.getImages().get(0).getImagePath()
                                            : null
                            )
                            .category(board.getCategory())
                            .profileUrl(profileUrl)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ✅ 카테고리별 게시글 조회 + 댓글 수 + 프로필 이미지
    public List<BoardListResponse> findAllWithCommentCountByCategory(String category) {
        List<Board> boards = boardRepository.findByCategoryOrderByCreatedDateDesc(category);

        return boards.stream()
                .map(board -> {
                    String profileUrl = getProfileUrl(board.getUserId());
                    return BoardListResponse.builder()
                            .boardNo(board.getBoardNo())
                            .title(board.getTitle())
                            .userId(board.getUserId())
                            .viewCount(board.getViewCount())
                            .createdDate(board.getCreatedDate())
                            .commentCount(commentRepository.countByBoard(board))
                            .imagePath(
                                    (board.getImages() != null && !board.getImages().isEmpty())
                                            ? board.getImages().get(0).getImagePath()
                                            : null
                            )
                            .category(board.getCategory())
                            .profileUrl(profileUrl)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ✅ 상세 게시글 조회 (조회수 증가 + 프로필 포함)
    public BoardDetailResponse findByIdForRead(Long id) {
        Board board = boardRepository.findById(id).orElse(null);
        if (board == null) return null;

        board.setViewCount(board.getViewCount() + 1);
        boardRepository.save(board);

        String profileUrl = getProfileUrl(board.getUserId());

        return BoardDetailResponse.builder()
                .boardNo(board.getBoardNo())
                .title(board.getTitle())
                .content(board.getContent())
                .userId(board.getUserId())
                .createdDate(board.getCreatedDate())
                .viewCount(board.getViewCount())
                .category(board.getCategory())
                .images(board.getImages())
                .profileUrl(profileUrl)
                .build();
    }

    // ✅ 프로필 URL 추출 메서드 (중복 제거)
    private String getProfileUrl(String userId) {
        Optional<User> userOpt = userRepository.findByUserId(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String img = user.getProfileImage();
            if (img != null && !img.isEmpty()) {
                return img.startsWith("/uploads/") ? img : "/uploads/" + img;
            }
        }
        return null;
    }

    // ✅ 단순 조회 (조회수 증가 X)
    public Board findByIdRaw(Long id) {
        return boardRepository.findById(id).orElse(null);
    }

    // ✅ 저장
    public Board save(Board board) {
        return boardRepository.save(board);
    }

    // ✅ 삭제
    public void delete(Long id) {
        boardRepository.deleteById(id);
    }

    // ✅ 카테고리별 단순 목록
    public List<Board> findByCategory(String category) {
        return boardRepository.findByCategoryOrderByCreatedDateDesc(category);
    }

    // ✅ 검색
    public List<BoardListResponse> searchBoards(String keyword, String type) {
        switch (type) {
            case "title":
                return boardRepository.findByTitleContainingIgnoreCase(keyword)
                        .stream().map(BoardListResponse::new).toList();
            case "content":
                return boardRepository.findByContentContainingIgnoreCase(keyword)
                        .stream().map(BoardListResponse::new).toList();
            case "userId":
                return boardRepository.findByUserIdContainingIgnoreCase(keyword)
                        .stream().map(BoardListResponse::new).toList();
            default:
                return List.of();
        }
    }
}
