package com.example.backend.controller;

import com.example.backend.dto.BoardGroupResponse;
import com.example.backend.entity.BoardGroup;
import com.example.backend.service.BoardGroupService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/board-group")
public class BoardGroupController {

    private final BoardGroupService service;

    // ✅ 게시판 그룹 전체 조회
    @GetMapping
    public ResponseEntity<List<BoardGroup>> getAllGroups() {
        return ResponseEntity.ok(service.findAll());
    }

    // ✅ 게시판 그룹 생성
    @PostMapping
    public ResponseEntity<BoardGroup> createGroup(@RequestBody BoardGroup group) {
        return ResponseEntity.ok(service.create(group));
    }

    // ✅ 게시판 그룹 단일 조회
    @GetMapping("/{id}")
    public ResponseEntity<BoardGroup> getGroup(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    // ✅ 게시판 그룹 수정
    @PutMapping("/{id}")
    public ResponseEntity<BoardGroup> updateGroup(
            @PathVariable Long id,
            @RequestBody BoardGroup group
    ) {
        return ResponseEntity.ok(service.update(id, group));
    }

    // ✅ 게시판 그룹 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }


    // ======================
    // 🔥 순서 올리기 API
    // ======================
    @PostMapping("/{id}/move-up")
    public ResponseEntity<Void> moveUp(@PathVariable Long id) {
        service.moveGroup(id, true);
        return ResponseEntity.ok().build();
    }

    // ======================
    // 🔥 순서 내리기 API
    // ======================
    @PostMapping("/{id}/move-down")
    public ResponseEntity<Void> moveDown(@PathVariable Long id) {
        service.moveGroup(id, false);
        return ResponseEntity.ok().build();
    }

    // ⭐ 사이드바용: 게시판 그룹 리스트 + 오늘 새 글 여부
    @GetMapping("/with-new")
    public ResponseEntity<List<BoardGroupResponse>> getGroupsWithNewFlag() {
        return ResponseEntity.ok(service.getGroupListWithNewFlag());
    }


}
