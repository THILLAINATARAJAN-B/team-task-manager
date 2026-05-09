package com.taskmanager.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ProjectRequest {

    @NotBlank(message = "Project name is required")
    private String name;

    private String description;

    @Future(message = "Deadline must be a future date")
    private LocalDate deadline;

    private List<Long> memberIds;
}