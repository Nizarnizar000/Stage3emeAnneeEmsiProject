package com.example.projectstagebackend.repository;

import com.example.projectstagebackend.model.Salle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SalleRepository extends JpaRepository<Salle, Long> {
    List<Salle> findByLocalisation(String localisation);

    List<Salle> findByLocalisationContainingIgnoreCase(String localisation);
}