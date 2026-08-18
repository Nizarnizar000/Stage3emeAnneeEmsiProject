package com.example.projectstagebackend.services;

import com.example.projectstagebackend.model.Participant;
import com.example.projectstagebackend.repository.ParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ParticipantService {

    @Autowired
    private ParticipantRepository participantRepository;

    public List<Participant> getAll() {
        return participantRepository.findAll();
    }

    public Optional<Participant> getById(Long id) {
        return participantRepository.findById(id);
    }

    public List<Participant> getByNom(String nom) {
        return participantRepository.findByNomContainingIgnoreCase(nom);
    }

    public List<Participant> getByCin(String cin) {
        return participantRepository.findByCinContainingIgnoreCase(cin);
    }

    public Participant save(Participant participant) {
        return participantRepository.save(participant);
    }

    public Participant update(Long id, Participant updated) {
        Participant participant = participantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Participant not found with id: " + id));

        participant.setNom(updated.getNom());
        participant.setPrenom(updated.getPrenom());
        participant.setCin(updated.getCin());
        participant.setPresence(updated.isPresence());

        return participantRepository.save(participant);
    }

    public void delete(Long id) {
        participantRepository.deleteById(id);
    }
}