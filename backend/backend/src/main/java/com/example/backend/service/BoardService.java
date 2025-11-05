package com.example.backend.service;

import com.example.backend.entity.Board;
import com.example.backend.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;

    // 전체 게시글 조회
    public List<Board> findAll() {
        return boardRepository.findAll();
    }

    // 특정 게시글 조회 (조회수 증가 포함)
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

// 삭제, 수정 등에선 단순 조회만 수행
    public Board findByIdRaw(Long id) {
    return boardRepository.findById(id).orElse(null);
}

    // 게시글 저장
    public Board save(Board board) {
        return boardRepository.save(board);
    }

    // 게시글 삭제
    public void delete(Long id) {
        boardRepository.deleteById(id);
    }
}
