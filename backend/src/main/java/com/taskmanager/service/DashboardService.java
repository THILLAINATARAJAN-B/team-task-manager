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
        List<Task>    myTasks  = taskRepository.findByAssignedTo(currentUser);

        // ✅ Overdue counted across ALL accessible project tasks, not just assigned-to-me
        long overdue = projects.stream()
                .flatMap(p -> taskRepository.findByProjectId(p.getId()).stream())
                .filter(t -> t.getDueDate() != null
                        && t.getDueDate().isBefore(LocalDate.now())
                        && t.getStatus() != TaskStatus.DONE)
                .count();

        long completed  = myTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long inProgress = myTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long todo       = myTasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();

        List<TaskResponse> recentTasks = myTasks.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map((Task t) -> taskService.toResponseDirect(t))
                .collect(Collectors.toList());

        List<ProjectResponse> recentProjects = projects.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map((Project p) -> projectService.toResponseDirect(p))
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalProjects(projects.size())
                .totalTasks(myTasks.size())
                .completedTasks((int) completed)
                .inProgressTasks((int) inProgress)
                .todoTasks((int) todo)
                .overdueTasks((int) overdue)
                .recentTasks(recentTasks)
                .recentProjects(recentProjects)
                .build();
    }
}