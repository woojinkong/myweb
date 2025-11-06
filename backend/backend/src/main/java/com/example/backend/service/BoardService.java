package com.example.backend.service;

import com.example.backend.dto.BoardListResponse;
import com.example.backend.entity.Board;
import com.example.backend.repository.BoardRepository;
import com.example.backend.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final CommentRepository commentRepository; // ✅ 추가

    // ✅ 전체 게시글 조회 + 댓글 수 포함
    public List<BoardListResponse> findAllWithCommentCount() {
        List<Board> boards = boardRepository.findAll(Sort.by(Sort.Direction.DESC, "boardNo"));
        return boards.stream()
                .map(board -> BoardListResponse.builder()
                        .boardNo(board.getBoardNo())
                        .title(board.getTitle())
                        .userId(board.getUserId())
                        .viewCount(board.getViewCount())
                        .createdDate(board.getCreatedDate())
                        .commentCount(commentRepository.countByBoard(board))
                        .imagePath(board.getImagePath())
                        .category(board.getCategory())
                        .build())
                .collect(Collectors.toList());
    }

    // ✅ 카테고리별 게시글 조회 + 댓글 수 포함
    public List<BoardListResponse> findAllWithCommentCountByCategory(String category) {
        List<Board> boards = boardRepository.findByCategoryOrderByCreatedDateDesc(category);
        return boards.stream()
                .map(board -> BoardListResponse.builder()
                        .boardNo(board.getBoardNo())
                        .title(board.getTitle())
                        .userId(board.getUserId())
                        .viewCount(board.getViewCount())
                        .createdDate(board.getCreatedDate())
                        .commentCount(commentRepository.countByBoard(board))
                        .imagePath(board.getImagePath())
                        .category(board.getCategory())
                        .build())
                .collect(Collectors.toList());
    }

    // ✅ 전체 게시글 조회 (단순)
    public List<Board> findAll() {
        return boardRepository.findAll();
    }

    // ✅ 특정 게시글 조회 (조회수 증가 포함)
    public Board findById(Long id) {
        Board board = boardRepository.findById(id).orElse(null);
        if (board != null) {
            board.setViewCount(board.getViewCount() + 1);
            boardRepository.save(board);
        }
        return board;
    }

    public Board findByIdForRead(Long id) {
        Board board = boardRepository.findById(id).orElse(null);
        if (board != null) {
            board.setViewCount(board.getViewCount() + 1);
            boardRepository.save(board);
        }
        return board;
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

    // ✅ 카테고리 전용 목록 (단순)
    public List<Board> findByCategory(String category) {
        return boardRepository.findByCategoryOrderByCreatedDateDesc(category);
    }
}
