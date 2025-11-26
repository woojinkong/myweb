package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthCheckController {

    @Value("${app.env}")
    private String env; // blue 또는 green이 자동 주입됨

    // 서버 살아있는지 체크
    @GetMapping("/hc")
    public ResponseEntity<?> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        return ResponseEntity.ok(response);
    }

    // blue/green 체크용
    @GetMapping("/env")
    public ResponseEntity<?> getEnv() {
        Map<String, String> response = new HashMap<>();
        response.put("env", env);
        return ResponseEntity.ok(response);
    }
}
