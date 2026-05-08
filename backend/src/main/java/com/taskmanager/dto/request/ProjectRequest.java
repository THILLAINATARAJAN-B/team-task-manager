package com.taskmanager.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ProjectRequest {

    @NotBlank(message = "Project name is required")
    private String name;

    private String description;
    private LocalDate deadline;
    private List<Long> memberIds; // user IDs to add as members
}