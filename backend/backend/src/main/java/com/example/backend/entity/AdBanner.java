package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "ad_banner")
@Getter
@Setter
public class AdBanner {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String position;  // AD_TOP, AD_BOTTOM
    private String imageUrl;
    private String linkUrl;

    private Integer width;
    private Integer height;

    private Boolean enabled;

    private LocalDateTime updatedAt;
}
