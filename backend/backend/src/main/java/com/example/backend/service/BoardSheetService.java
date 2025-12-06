package com.example.backend.service;

import com.example.backend.entity.BoardSheet;
import com.example.backend.repository.BoardSheetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BoardSheetService {

    private final BoardSheetRepository repository;

    public BoardSheet getSheet(Long groupId) {
        return repository.findById(groupId)
                .orElse(BoardSheet.builder()
                        .groupId(groupId)
                        .sheetData("[]")  // 기본 빈 시트
                        .updatedAt(LocalDateTime.now().toString())
                        .build());
    }

    public BoardSheet saveSheet(Long groupId, String jsonData) {
        BoardSheet sheet = repository.findById(groupId)
                .orElse(new BoardSheet());

        sheet.setGroupId(groupId);
        sheet.setSheetData(jsonData);
        sheet.setUpdatedAt(LocalDateTime.now().toString());

        return repository.save(sheet);
    }
}
