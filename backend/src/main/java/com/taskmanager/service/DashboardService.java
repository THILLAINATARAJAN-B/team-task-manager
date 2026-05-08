package com.taskmanager.service;

import com.taskmanager.dto.response.DashboardResponse;
import com.taskmanager.dto.response.ProjectResponse;
import com.taskmanager.dto.response.TaskResponse;
import com.taskmanager.entity.*;
import com.taskmanager.enums.TaskStatus;
import com.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final ProjectService projectService;
    private final TaskService taskService;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(User currentUser) {
        List<Project> projects = projectRepository.findAllAccessibleProjects(currentUser);
        List<Task> assignedTasks = taskRepository.findByAssignedTo(currentUser);
        List<Task> overdueTasks = taskRepository.findOverdueTasks(currentUser, LocalDate.now());

        long completed = assignedTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long inProgress = assignedTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long todo = assignedTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.TODO).count();

        List<TaskResponse> recentTasks = assignedTasks.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(t -> taskService.toResponseDirect(t))
                .collect(Collectors.toList());

        List<ProjectResponse> recentProjects = projects.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(p -> projectService.toResponseDirect(p))
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalProjects(projects.size())
                .totalTasks(assignedTasks.size())
                .completedTasks((int) completed)
                .inProgressTasks((int) inProgress)
                .todoTasks((int) todo)
                .overdueTasks(overdueTasks.size())
                .recentTasks(recentTasks)
                .recentProjects(recentProjects)
                .build();
    }
}