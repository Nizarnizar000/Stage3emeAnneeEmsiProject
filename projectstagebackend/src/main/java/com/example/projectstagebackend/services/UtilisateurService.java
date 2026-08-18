package com.example.projectstagebackend.services;

import com.example.projectstagebackend.model.Utilisateur;
import com.example.projectstagebackend.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UtilisateurService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    public List<Utilisateur> getAll() {
        return utilisateurRepository.findAll();
    }

    public Optional<Utilisateur> getById(Long id) {
        return utilisateurRepository.findById(id);
    }

    public Optional<Utilisateur> getByEmail(String email) {
        return utilisateurRepository.findByEmail(email);
    }

    public Utilisateur save(Utilisateur utilisateur) {
        return utilisateurRepository.save(utilisateur);
    }

    public Utilisateur update(Long id, Utilisateur updated) {
        Utilisateur u = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur not found with id: " + id));

        u.setNom(updated.getNom());
        u.setPrenom(updated.getPrenom());
        u.setEmail(updated.getEmail());
        u.setPassword(updated.getPassword());
        u.setRole(updated.getRole());

        return utilisateurRepository.save(u);
    }

    public void delete(Long id) {
        utilisateurRepository.deleteById(id);
    }
}