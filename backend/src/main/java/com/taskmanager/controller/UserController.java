package com.taskmanager.controller;

import com.taskmanager.entity.User;
import com.taskmanager.enums.Role;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers(
            @AuthenticationPrincipal User currentUser) {

        boolean isAdmin = currentUser.getRole().equals(Role.ADMIN);

        List<Map<String, Object>> users = userRepository.findAll()
                .stream()
                .filter(u -> !u.getId().equals(currentUser.getId()))
                .map(u -> {
                    if (isAdmin) {
                        return Map.<String, Object>of(
                                "userId",   u.getId(),
                                "fullName", u.getFullName(),
                                "email",    u.getEmail(),
                                "role",     u.getRole().name()
                        );
                    } else {
                        return Map.<String, Object>of(
                                "userId",   u.getId(),
                                "fullName", u.getFullName(),
                                "role",     u.getRole().name()
                        );
                    }
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(Map.of(
                "userId",    currentUser.getId(),
                "fullName",  currentUser.getFullName(),
                "email",     currentUser.getEmail(),
                "role",      currentUser.getRole().name(),
                "createdAt", currentUser.getCreatedAt()
        ));
    }
}