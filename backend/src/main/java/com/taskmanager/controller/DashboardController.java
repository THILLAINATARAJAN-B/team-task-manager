package com.taskmanager.controller;

import com.taskmanager.dto.response.DashboardResponse;
import com.taskmanager.entity.User;
import com.taskmanager.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(dashboardService.getDashboard(currentUser));
    }
}