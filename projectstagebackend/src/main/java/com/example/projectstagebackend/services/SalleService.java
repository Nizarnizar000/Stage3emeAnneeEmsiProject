package com.example.projectstagebackend.services;

import com.example.projectstagebackend.model.Salle;
import com.example.projectstagebackend.repository.SalleRepository;
import org.springframework.beans.factory.annotation.Autowired;


import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SalleService {

    @Autowired
    private SalleRepository salleRepository;

    public List<Salle> getAll() {
        return salleRepository.findAll();
    }

    public Optional<Salle> getById(Long id) {
        return salleRepository.findById(id);
    }

    public List<Salle> getByLocalisation(String localisation) {
        return salleRepository.findByLocalisationContainingIgnoreCase(localisation);
    }

    public Salle save(Salle salle) {
        return salleRepository.save(salle);
    }

    public Salle update(Long id, Salle updated) {
        Salle salle = salleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salle not found with id: " + id));

        salle.setLocalisation(updated.getLocalisation());
        salle.setAdmin(updated.getAdmin());

        return salleRepository.save(salle);
    }

    public void delete(Long id) {
        salleRepository.deleteById(id);
    }
}