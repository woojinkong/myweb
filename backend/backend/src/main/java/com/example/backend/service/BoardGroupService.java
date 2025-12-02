package com.example.backend.service;

import com.example.backend.dto.BoardGroupResponse;
import com.example.backend.entity.BoardGroup;
import com.example.backend.repository.BoardGroupRepository;

import com.example.backend.repository.BoardRepository;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardGroupService {

    private final BoardGroupRepository boardGroupRepository;
    private final BoardRepository boardRepository;

    // ✅ 게시판 생성
    public BoardGroup create(BoardGroup group) {

        int maxOrder = boardGroupRepository.findMaxOrderIndex();
        group.setOrderIndex(maxOrder + 1);
        return boardGroupRepository.save(group);
    }

    // ✅ 게시판 전체 목록 조회
    public List<BoardGroup> findAll() {

        List<BoardGroup> list = boardGroupRepository.findAllByOrderByOrderIndexAsc();
        // 각 그룹에 게시글 수 추가 (DTO 사용해도 되지만 엔티티에 임시 저장해도 OK)
        list.forEach(g -> {
            int count = boardRepository.countByGroupId(g.getId());
            g.setBoardCount(count); // 엔티티 안에 boardCount 필드를 추가해야 함
        });
        return list;
    }

    // ✅ 게시판 단일 조회
    public BoardGroup findById(Long id) {
        return boardGroupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시판을 찾을 수 없습니다."));
    }

    // ✅ 게시판 수정
    public BoardGroup update(Long id, BoardGroup updatedGroup) {
        BoardGroup existing = findById(id);

        existing.setName(updatedGroup.getName());
        existing.setAdminOnlyWrite(updatedGroup.isAdminOnlyWrite());
        existing.setAllowComment(updatedGroup.isAllowComment());
        existing.setWritePoint(updatedGroup.getWritePoint());
        existing.setAdminOnly(updatedGroup.isAdminOnly());


        return boardGroupRepository.save(existing);
    }

    // ✅ 게시판 삭제
    public void delete(Long id) {
        int count = boardRepository.countByGroupId(id);
        if (count > 0) {
            throw new RuntimeException("해당 게시판 그룹에 게시글이 있어 삭제할 수 없습니다.");
        }
        boardGroupRepository.deleteById(id);
        normalizeOrder();
    }

    // ================================================
    // 🔥 6) 그룹 순서 변경
    // ================================================
    @Transactional
    public void moveGroup(Long id, boolean up) {

        normalizeOrder();

        BoardGroup target = findById(id);
        int currentOrder = target.getOrderIndex();
        int swapOrder = up ? currentOrder - 1 : currentOrder + 1;

        // 옮길 상대 찾기
        BoardGroup swapWith = boardGroupRepository.findByOrderIndex(swapOrder);
        if (swapWith == null) return; // 이동 불가

        // swap
        target.setOrderIndex(swapOrder);
        swapWith.setOrderIndex(currentOrder);

        boardGroupRepository.save(target);
        boardGroupRepository.save(swapWith);
    }


    @Transactional
    public void normalizeOrder() {
        List<BoardGroup> all = boardGroupRepository.findAllByOrderByOrderIndexAsc();
        int index = 1;
        for (BoardGroup g : all) {
            g.setOrderIndex(index++);
            boardGroupRepository.save(g);
        }
    }

    public List<BoardGroupResponse> getGroupListWithNewFlag() {
        List<BoardGroup> groups = boardGroupRepository.findAllByOrderByOrderIndexAsc();

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();

        return groups.stream()
                .map(g -> BoardGroupResponse.builder()
                        .groupId(g.getId())
                        .name(g.getName())
                        .type(g.getType())
                        .hasNew(boardRepository.existsNewBoardsToday(g.getId(), todayStart))
                        .adminOnly(g.isAdminOnly())
                        .build()
                ).toList();
    }


    // ===============================
    // 🔥 서버 최초 실행 시 기본 게시판 생성
    // ===============================
//    @PostConstruct
//    public void initDefaultGroups() {
//        createIfNotExists("공지사항", true, false); // 관리자만 글쓰기, 댓글 불가
//        createIfNotExists("자유게시판", false, true); // 누구나 글쓰기, 댓글 허용
//    }

//    private void createIfNotExists(String name, boolean adminOnlyWrite, boolean allowComment) {
//        if (!boardGroupRepository.existsByName(name)) {
//            int maxOrder = boardGroupRepository.findMaxOrderIndex();
//            System.out.println("### createIfNotExists 실행됨: " + name);
//            BoardGroup group = BoardGroup.builder()
//                    .name(name)
//                    .adminOnlyWrite(adminOnlyWrite)
//                    .allowComment(allowComment)
//                    .orderIndex(maxOrder + 1)
//                    .type("BOARD")
//                    .build();
//
//            boardGroupRepository.save(group);
//        }
//    }


}
