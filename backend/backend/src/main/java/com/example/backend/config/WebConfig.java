package com.example.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // ✅ application.yml에서 지정한 경로 사용
        System.out.println("✅ [DEBUG] WebConfig uploadDir = " + uploadDir);

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/");
                
    }
}
