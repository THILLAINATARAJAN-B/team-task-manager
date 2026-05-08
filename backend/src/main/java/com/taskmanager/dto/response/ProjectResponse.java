package com.taskmanager.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDate deadline;
    private LocalDateTime createdAt;
    private String ownerName;
    private Long ownerId;
    private int totalTasks;
    private int completedTasks;
    private List<MemberInfo> members;

    @Data @Builder
    public static class MemberInfo {
        private Long userId;
        private String fullName;
        private String email;
        private String role;
    }
}