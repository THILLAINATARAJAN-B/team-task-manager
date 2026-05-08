package com.taskmanager.service;

import com.taskmanager.dto.request.TaskRequest;
import com.taskmanager.dto.response.TaskResponse;
import com.taskmanager.entity.*;
import com.taskmanager.enums.Role;
import com.taskmanager.enums.TaskStatus;
import com.taskmanager.exception.*;
import com.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByProject(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        validateProjectAccess(project, currentUser);
        return taskRepository.findByProjectId(projectId).stream()
                .map(this::toResponseDirect).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long taskId, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        validateProjectAccess(task.getProject(), currentUser);
        return toResponseDirect(task);
    }

    @Transactional
    public TaskResponse createTask(Long projectId, TaskRequest request, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        validateProjectAccess(project, currentUser);

        User assignedTo = null;
        if (request.getAssignedToId() != null) {
            assignedTo = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found"));
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : com.taskmanager.enums.TaskPriority.MEDIUM)
                .dueDate(request.getDueDate())
                .project(project)
                .assignedTo(assignedTo)
                .createdBy(currentUser)
                .build();

        taskRepository.save(task);
        return toResponseDirect(task);
    }

    @Transactional
    public TaskResponse updateTask(Long taskId, TaskRequest request, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        validateProjectAccess(task.getProject(), currentUser);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());

        if (request.getAssignedToId() != null) {
            User assignedTo = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            task.setAssignedTo(assignedTo);
        }
        taskRepository.save(task);
        return toResponseDirect(task);
    }

    @Transactional
    public TaskResponse updateTaskStatus(Long taskId, TaskStatus status, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        validateProjectAccess(task.getProject(), currentUser);
        task.setStatus(status);
        taskRepository.save(task);
        return toResponseDirect(task);
    }

    @Transactional
    public void deleteTask(Long taskId, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        boolean isOwner = task.getProject().getOwner().getId().equals(currentUser.getId());
        boolean isCreator = task.getCreatedBy().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole().equals(Role.ADMIN);
        if (!isOwner && !isCreator && !isAdmin) {
            throw new UnauthorizedException("You cannot delete this task");
        }
        taskRepository.delete(task);
    }

    private void validateProjectAccess(Project project, User user) {
        boolean isOwner = project.getOwner().getId().equals(user.getId());
        boolean isMember = projectMemberRepository.existsByProjectAndUser(project, user);
        if (!isOwner && !isMember) {
            throw new UnauthorizedException("Access denied to this project");
        }
    }

    // Public so DashboardService can call within same transaction
    public TaskResponse toResponseDirect(Task task) {
        boolean overdue = task.getDueDate() != null
                && task.getDueDate().isBefore(LocalDate.now())
                && task.getStatus() != TaskStatus.DONE;

        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus().name())
                .priority(task.getPriority().name())
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .projectId(task.getProject().getId())
                .projectName(task.getProject().getName())
                .assignedToId(task.getAssignedTo() != null ? task.getAssignedTo().getId() : null)
                .assignedToName(task.getAssignedTo() != null ? task.getAssignedTo().getFullName() : null)
                .createdById(task.getCreatedBy().getId())
                .createdByName(task.getCreatedBy().getFullName())
                .overdue(overdue)
                .build();
    }
}