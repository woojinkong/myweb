package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
@AllArgsConstructor
public class MonthlyStatsDTO {
    private int year;
    private int month;
    private long count;
}
