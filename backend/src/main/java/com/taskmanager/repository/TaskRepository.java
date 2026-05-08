package com.taskmanager.repository;

import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query("SELECT t FROM Task t JOIN FETCH t.project JOIN FETCH t.createdBy " +
           "LEFT JOIN FETCH t.assignedTo WHERE t.project.id = :projectId")
    List<Task> findByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT t FROM Task t JOIN FETCH t.project JOIN FETCH t.createdBy " +
           "LEFT JOIN FETCH t.assignedTo WHERE t.assignedTo = :user")
    List<Task> findByAssignedTo(@Param("user") User user);

    @Query("SELECT t FROM Task t JOIN FETCH t.project JOIN FETCH t.createdBy " +
           "LEFT JOIN FETCH t.assignedTo " +
           "WHERE t.assignedTo = :user AND t.dueDate < :today AND t.status <> 'DONE'")
    List<Task> findOverdueTasks(@Param("user") User user, @Param("today") LocalDate today);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.status = :status")
    Long countByProjectIdAndStatus(@Param("projectId") Long projectId,
                                   @Param("status") TaskStatus status);
}