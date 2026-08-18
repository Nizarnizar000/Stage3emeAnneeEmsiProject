package com.example.projectstagebackend.repository;

import com.example.projectstagebackend.model.ResponsableDePlanification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResponsableDePlanificationRepository extends JpaRepository<ResponsableDePlanification, Long> {
    List<ResponsableDePlanification> findByNomContainingIgnoreCase(String nom);
}