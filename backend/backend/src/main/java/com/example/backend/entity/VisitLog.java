package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "visit_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long visitId;

    @Column(nullable = false)
    private String ipAddress; // 방문자 IP

    @Column(nullable = false)
    private LocalDateTime visitDate; // 방문 시간
}
