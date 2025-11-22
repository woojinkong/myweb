package com.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdBannerDTO {
    private String position;
    private String imageUrl;
    private String linkUrl;
    private Integer width;
    private Integer height;
    private Boolean enabled;
}
