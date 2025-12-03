package com.example.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminPasswordController {

    private static final String ADMIN_SECRET = "036903";

    @PostMapping("/verify-password")
    public ResponseEntity<Boolean> verify(@RequestBody Map<String, String> body) {
        String input = body.get("password");
        boolean success = ADMIN_SECRET.equals(input);
        return ResponseEntity.ok(success);
    }
}
