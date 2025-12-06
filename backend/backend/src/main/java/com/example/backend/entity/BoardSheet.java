package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "board_sheet")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardSheet {

    @Id
    private Long groupId;   // board_group.id 와 동일

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String sheetData;  // JSON 문자열

    private String updatedAt;
}
