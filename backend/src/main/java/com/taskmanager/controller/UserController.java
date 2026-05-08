package com.taskmanager.controller;

import com.taskmanager.entity.User;
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
        List<Map<String, Object>> users = userRepository.findAll()
                .stream()
                .filter(u -> !u.getId().equals(currentUser.getId())) // exclude self
                .map(u -> Map.of(
                        "userId", (Object) u.getId(),
                        "fullName", u.getFullName(),
                        "email", u.getEmail(),
                        "role", u.getRole().name()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}