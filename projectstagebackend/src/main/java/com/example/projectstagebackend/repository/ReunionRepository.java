package com.example.projectstagebackend.repository;

import com.example.projectstagebackend.model.Reunion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReunionRepository extends JpaRepository<Reunion, Long> {
    List<Reunion> findByTitre(String titre);

    List<Reunion> findByTitreContainingIgnoreCase(String titre);
}