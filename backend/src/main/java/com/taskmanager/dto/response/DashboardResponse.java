package com.taskmanager.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data @Builder
public class DashboardResponse {
    private int totalProjects;
    private int totalTasks;
    private int completedTasks;
    private int inProgressTasks;
    private int overdueTasks;
    private int todoTasks;
    private List<TaskResponse> recentTasks;
    private List<ProjectResponse> recentProjects;
}