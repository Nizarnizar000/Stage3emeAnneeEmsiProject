package com.example.projectstagebackend.repository;

import com.example.projectstagebackend.model.Participant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {
    List<Participant> findByNomContainingIgnoreCase(String nom);

    List<Participant> findByCinContainingIgnoreCase(String cin);

    List<Participant> findByReunions_Id(Long reunionId);
}