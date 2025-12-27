package com.example.backend.service;

import com.example.backend.dto.BoardGroupResponse;
import com.example.backend.entity.BoardGroup;
import com.example.backend.repository.BoardGroupRepository;

import com.example.backend.repository.BoardRepository;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardGroupService {

    private final BoardGroupRepository boardGroupRepository;
    private final BoardRepository boardRepository;
    private final BCryptPasswordEncoder passwordEncoder;


    // ✅ 게시판 생성
    public BoardGroup create(BoardGroup group) {

        int maxOrder = boardGroupRepository.findMaxOrderIndex();
        group.setOrderIndex(maxOrder + 1);
        if (group.isPasswordEnabled()) {
            if (group.getPassword() == null || group.getPassword().isBlank()) {
                throw new IllegalArgumentException("게시판 비밀번호가 필요합니다.");
            }
            group.setPasswordHash(passwordEncoder.encode(group.getPassword()));
        } else {
            group.setPasswordHash(null);
        }

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
        existing.setSheetEnabled(updatedGroup.isSheetEnabled());
        existing.setPasswordEnabled(updatedGroup.isPasswordEnabled());



        // 🔐 비밀번호 ON
        if (updatedGroup.isPasswordEnabled()) {
            if (updatedGroup.getPassword() != null && !updatedGroup.getPassword().isBlank()) {
                existing.setPasswordHash(
                        passwordEncoder.encode(updatedGroup.getPassword())
                );
            }
        } else {
            existing.setPasswordHash(null);
        }


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

        LocalDateTime todayStart = LocalDateTime.now().minusDays(3);

        return groups.stream()
                .map(g -> BoardGroupResponse.builder()
                        .groupId(g.getId())
                        .name(g.getName())
                        .type(g.getType())
                        .hasNew(boardRepository.existsNewBoardsToday(g.getId(), todayStart))
                        .adminOnly(g.isAdminOnly())
                        .passwordEnabled(g.isPasswordEnabled())
                        .build()
                ).toList();
    }




}
