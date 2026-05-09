package com.taskmanager.service;

import com.taskmanager.dto.request.TaskRequest;
import com.taskmanager.dto.response.TaskResponse;
import com.taskmanager.entity.*;
import com.taskmanager.enums.Role;
import com.taskmanager.enums.TaskPriority;
import com.taskmanager.enums.TaskStatus;
import com.taskmanager.exception.*;
import com.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
        Project project = projectRepository.findByIdWithOwner(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        validateProjectAccess(project, currentUser);
        return taskRepository.findByProjectId(projectId).stream()
                .map(this::toResponseDirect).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long taskId, User currentUser) {
        Task task = taskRepository.findByIdWithDetails(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        validateProjectAccess(task.getProject(), currentUser);
        return toResponseDirect(task);
    }

    @Transactional
    public TaskResponse createTask(Long projectId, TaskRequest request, User currentUser) {
        Project project = projectRepository.findByIdWithOwner(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        validateProjectAccess(project, currentUser);

        User assignedTo = null;
        if (request.getAssignedToId() != null) {
            assignedTo = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found"));
            if (!projectMemberRepository.existsByProjectAndUser(project, assignedTo)) {
                throw new UnauthorizedException("Assigned user is not a member of this project");
            }
        }

        Task task = Task.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription() != null
                        ? request.getDescription().trim() : null)
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
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
        Task task = taskRepository.findByIdWithDetails(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        validateProjectAccess(task.getProject(), currentUser);

        boolean isProjectOwner = task.getProject().getOwner().getId().equals(currentUser.getId());
        boolean isAdmin        = currentUser.getRole().equals(Role.ADMIN);
        boolean isAssignee     = task.getAssignedTo() != null
                                 && task.getAssignedTo().getId().equals(currentUser.getId());

        // ✅ FIX: unassigned task — any project member can update its status
        boolean isProjectMember = projectMemberRepository
                .existsByProjectAndUser(task.getProject(), currentUser);
        boolean taskIsUnassigned = task.getAssignedTo() == null;

        if (!isProjectOwner && !isAdmin && !isAssignee && !taskIsUnassigned) {
            throw new UnauthorizedException(
                "Only the project owner, admin, or task assignee can edit this task");
        }

        // Extra safety: if task is unassigned but caller is not even a member, deny
        if (taskIsUnassigned && !isProjectOwner && !isAdmin && !isProjectMember) {
            throw new UnauthorizedException("Access denied");
        }

        if (isProjectOwner || isAdmin) {
            // Owner / Admin — full edit rights
            task.setTitle(request.getTitle().trim());
            task.setDescription(request.getDescription() != null
                    ? request.getDescription().trim() : null);
            if (request.getPriority() != null) task.setPriority(request.getPriority());

            if (request.getAssignedToId() != null) {
                User assignedTo = userRepository.findById(request.getAssignedToId())
                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                if (!projectMemberRepository.existsByProjectAndUser(task.getProject(), assignedTo)) {
                    throw new UnauthorizedException(
                        "Assigned user is not a member of this project");
                }
                task.setAssignedTo(assignedTo);
            } else {
                task.setAssignedTo(null);
            }

            // ✅ Only owner/admin can change dueDate
            task.setDueDate(request.getDueDate());

        } else {
            // Member (assignee or picking up unassigned task) — status only
            // ✅ FIX: dueDate change is NOT allowed for members
        }

        // Both owner/admin AND member can update status
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
            if (request.getStatus() == TaskStatus.DONE) {
                if (task.getCompletedAt() == null) {
                    task.setCompletedAt(LocalDateTime.now());
                    task.setCompletedBy(currentUser);
                }
            } else {
                task.setCompletedAt(null);
                task.setCompletedBy(null);
            }
        }

        taskRepository.save(task);
        return toResponseDirect(task);
    }

    @Transactional
    public TaskResponse updateTaskStatus(Long taskId, TaskStatus newStatus, User currentUser) {
        Task task = taskRepository.findByIdWithDetails(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        validateProjectAccess(task.getProject(), currentUser);

        boolean isProjectOwner  = task.getProject().getOwner().getId().equals(currentUser.getId());
        boolean isAdmin         = currentUser.getRole().equals(Role.ADMIN);
        boolean isAssignee      = task.getAssignedTo() != null
                                  && task.getAssignedTo().getId().equals(currentUser.getId());
        // ✅ FIX: unassigned task — any project member can update status (Kanban drag)
        boolean taskIsUnassigned = task.getAssignedTo() == null;
        boolean isProjectMember  = projectMemberRepository
                .existsByProjectAndUser(task.getProject(), currentUser);

        if (!isProjectOwner && !isAdmin && !isAssignee
                && !(taskIsUnassigned && isProjectMember)) {
            throw new UnauthorizedException(
                "Only the task assignee, project member, or project owner can update task status");
        }

        task.setStatus(newStatus);

        // ✅ Track completion metadata on Kanban drag
        if (newStatus == TaskStatus.DONE) {
            task.setCompletedAt(LocalDateTime.now());
            task.setCompletedBy(currentUser);
        } else {
            task.setCompletedAt(null);
            task.setCompletedBy(null);
        }

        taskRepository.save(task);
        return toResponseDirect(task);
    }

    @Transactional
    public void deleteTask(Long taskId, User currentUser) {
        Task task = taskRepository.findByIdWithDetails(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        boolean isProjectOwner = task.getProject().getOwner().getId().equals(currentUser.getId());
        boolean isAdmin        = currentUser.getRole().equals(Role.ADMIN);

        if (!isProjectOwner && !isAdmin) {
            throw new UnauthorizedException(
                "Only the project owner or admin can delete tasks");
        }
        taskRepository.delete(task);
    }

    private void validateProjectAccess(Project project, User user) {
        boolean isOwner  = project.getOwner().getId().equals(user.getId());
        boolean isMember = projectMemberRepository.existsByProjectAndUser(project, user);
        if (!isOwner && !isMember) {
            throw new UnauthorizedException("Access denied to this project");
        }
    }

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
                .completedAt(task.getCompletedAt())
                .completedByName(task.getCompletedBy() != null
                        ? task.getCompletedBy().getFullName() : null)
                .projectId(task.getProject().getId())
                .projectName(task.getProject().getName())
                .assignedToId(task.getAssignedTo() != null
                        ? task.getAssignedTo().getId() : null)
                .assignedToName(task.getAssignedTo() != null
                        ? task.getAssignedTo().getFullName() : null)
                .createdById(task.getCreatedBy().getId())
                .createdByName(task.getCreatedBy().getFullName())
                .overdue(overdue)
                .build();
    }
}