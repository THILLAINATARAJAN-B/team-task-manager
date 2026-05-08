package com.taskmanager.repository;

import com.taskmanager.entity.Project;
import com.taskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT DISTINCT p FROM Project p JOIN FETCH p.owner " +
           "WHERE p.owner = :user")
    List<Project> findByOwner(@Param("user") User user);

    @Query("SELECT DISTINCT p FROM Project p JOIN FETCH p.owner " +
           "WHERE p.owner = :user OR EXISTS " +
           "(SELECT m FROM ProjectMember m WHERE m.project = p AND m.user = :user)")
    List<Project> findAllAccessibleProjects(@Param("user") User user);

    @Query("SELECT DISTINCT p FROM Project p JOIN FETCH p.owner WHERE p.id = :id")
    Optional<Project> findByIdWithOwner(@Param("id") Long id);
}