package com.example.backend.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<?> handleCustom(CustomException ex) {
        return ResponseEntity.status(ex.getStatus())
                .body(Map.of(
                        "message", ex.getMessage()
                ));
    }
}