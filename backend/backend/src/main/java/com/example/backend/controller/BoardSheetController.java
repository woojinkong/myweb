package com.example.backend.controller;

import com.example.backend.entity.BoardSheet;
import com.example.backend.service.BoardSheetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sheet")
public class BoardSheetController {

    private final BoardSheetService service;

    // ✓ 시트 불러오기
    @GetMapping("/{groupId}")
    public BoardSheet getSheet(@PathVariable Long groupId) {
        return service.getSheet(groupId);
    }

    // ✓ 시트 저장하기
    @PostMapping("/{groupId}")
    public BoardSheet saveSheet(
            @PathVariable Long groupId,
            @RequestBody String jsonData) {
        return service.saveSheet(groupId, jsonData);
    }
}
