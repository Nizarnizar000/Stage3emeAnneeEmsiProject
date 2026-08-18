package com.example.projectstagebackend.services;

import com.example.projectstagebackend.model.ResponsableDePlanification;
import com.example.projectstagebackend.repository.ResponsableDePlanificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ResponsableDePlanificationService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ResponsableDePlanificationRepository responsableRepository;

    public List<ResponsableDePlanification> getAll() {
        return responsableRepository.findAll();
    }

    public Optional<ResponsableDePlanification> getById(Long id) {
        return responsableRepository.findById(id);
    }

    public List<ResponsableDePlanification> getByNom(String nom) {
        return responsableRepository.findByNomContainingIgnoreCase(nom);
    }

    public ResponsableDePlanification save(ResponsableDePlanification responsable) {
        responsable.setPassword(passwordEncoder.encode(responsable.getPassword()));
        responsable.setRole("RESPONSABLE");
        return responsableRepository.save(responsable);
    }

    public ResponsableDePlanification update(Long id, ResponsableDePlanification updated) {
        ResponsableDePlanification responsable = responsableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Responsable not found with id " + id));

        responsable.setNom(updated.getNom());
        responsable.setPrenom(updated.getPrenom());
        responsable.setEmail(updated.getEmail());
        if (updated.getPassword() != null && !updated.getPassword().isBlank()) {
            responsable.setPassword(passwordEncoder.encode(updated.getPassword()));
        }
        responsable.setRole(updated.getRole());

        return responsableRepository.save(responsable);
    }

    public void delete(Long id) {
        responsableRepository.deleteById(id);
    }
}