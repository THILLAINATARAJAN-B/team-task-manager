package com.taskmanager.service;

import com.taskmanager.dto.request.ProjectRequest;
import com.taskmanager.dto.response.ProjectResponse;
import com.taskmanager.entity.*;
import com.taskmanager.enums.Role;
import com.taskmanager.enums.TaskStatus;
import com.taskmanager.exception.*;
import com.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjects(User currentUser) {
        return projectRepository.findAllAccessibleProjects(currentUser)
                .stream().map(this::toResponseDirect).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id, User currentUser) {
        Project project = projectRepository.findByIdWithOwner(id)  // ✅ eager owner load
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        validateAccess(project, currentUser);
        return toResponseDirect(project);
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request, User currentUser) {
        Project project = Project.builder()
                .name(request.getName().trim())
                .description(request.getDescription() != null
                        ? request.getDescription().trim() : null)
                .deadline(request.getDeadline())
                .owner(currentUser)
                .build();
        projectRepository.save(project);

        ProjectMember ownerMember = ProjectMember.builder()
                .project(project).user(currentUser).role(Role.ADMIN).build();
        projectMemberRepository.save(ownerMember);

        if (request.getMemberIds() != null) {
            for (Long memberId : request.getMemberIds()) {
                userRepository.findById(memberId).ifPresent(member -> {
                    if (!member.getId().equals(currentUser.getId())) {
                        projectMemberRepository.save(ProjectMember.builder()
                                .project(project).user(member).role(Role.MEMBER).build());
                    }
                });
            }
        }
        return toResponseDirect(project);
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request, User currentUser) {
        Project project = projectRepository.findByIdWithOwner(id)  // ✅
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!project.getOwner().getId().equals(currentUser.getId())
                && !currentUser.getRole().equals(Role.ADMIN)) {
            throw new UnauthorizedException("Only project owner or admin can update this project");
        }

        project.setName(request.getName().trim());
        project.setDescription(request.getDescription() != null
                ? request.getDescription().trim() : null);
        project.setDeadline(request.getDeadline());
        projectRepository.save(project);
        return toResponseDirect(project);
    }

    @Transactional
    public void deleteProject(Long id, User currentUser) {
        Project project = projectRepository.findByIdWithOwner(id)  // ✅
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        boolean isGlobalAdmin = currentUser.getRole().equals(Role.ADMIN);

        if (!isOwner && !isGlobalAdmin) {
            throw new UnauthorizedException("Only the project owner can delete this project");
        }
        projectRepository.delete(project);
    }

    @Transactional
    public ProjectResponse addMember(Long projectId, Long userId, User currentUser) {
        Project project = projectRepository.findByIdWithOwner(projectId)  // ✅
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Only project owner can add members");
        }

        User userToAdd = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (projectMemberRepository.existsByProjectAndUser(project, userToAdd)) {
            throw new IllegalArgumentException(  // ✅ 400 not 500
                userToAdd.getFullName() + " is already a member of this project");
        }

        projectMemberRepository.save(ProjectMember.builder()
                .project(project).user(userToAdd).role(Role.MEMBER).build());

        return toResponseDirect(project);
    }

    @Transactional
    public void removeMember(Long projectId, Long userId, User currentUser) {
        Project project = projectRepository.findByIdWithOwner(projectId)  // ✅
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Only project owner can remove members");
        }

        if (userId.equals(currentUser.getId())) {
            throw new IllegalArgumentException("Project owner cannot remove themselves");  // ✅ 400
        }

        User userToRemove = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        taskRepository.findByProjectId(projectId)
                .stream()
                .filter(t -> t.getAssignedTo() != null
                        && t.getAssignedTo().getId().equals(userId))
                .forEach(t -> {
                    t.setAssignedTo(null);
                    taskRepository.save(t);
                });

        projectMemberRepository.deleteByProjectAndUser(project, userToRemove);
    }

    private void validateAccess(Project project, User user) {
        boolean isOwner = project.getOwner().getId().equals(user.getId());
        boolean isMember = projectMemberRepository.existsByProjectAndUser(project, user);
        if (!isOwner && !isMember) {
            throw new UnauthorizedException("Access denied to this project");
        }
    }

    public ProjectResponse toResponseDirect(Project project) {
        List<Task> tasks = taskRepository.findByProjectId(project.getId());
        long completedTasks = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE).count();

        List<ProjectMember> members = projectMemberRepository.findByProject(project);
        List<ProjectResponse.MemberInfo> memberInfos = members.stream().map(m ->
                ProjectResponse.MemberInfo.builder()
                        .userId(m.getUser().getId())
                        .fullName(m.getUser().getFullName())
                        .email(m.getUser().getEmail())
                        .role(m.getRole().name())
                        .build()
        ).collect(Collectors.toList());

        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .deadline(project.getDeadline())
                .createdAt(project.getCreatedAt())
                .ownerName(project.getOwner().getFullName())
                .ownerId(project.getOwner().getId())
                .totalTasks(tasks.size())
                .completedTasks((int) completedTasks)
                .members(memberInfos)
                .build();
    }
}