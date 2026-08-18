package com.example.projectstagebackend.services;

import com.example.projectstagebackend.model.Participant;
import com.example.projectstagebackend.model.Reunion;
import com.example.projectstagebackend.model.Salle;
import com.example.projectstagebackend.repository.ParticipantRepository;
import com.example.projectstagebackend.repository.ReunionRepository;
import com.example.projectstagebackend.repository.SalleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReunionService {

    @Autowired
    private ReunionRepository reunionRepository;

    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private SalleRepository salleRepository;

    public List<Reunion> getAll() {
        return reunionRepository.findAll();
    }

    public Optional<Reunion> getById(Long id) {
        return reunionRepository.findById(id);
    }

    public List<Reunion> getByTitre(String titre) {
        return reunionRepository.findByTitreContainingIgnoreCase(titre);
    }

    public Reunion save(Reunion reunion) {
        return reunionRepository.save(reunion);
    }

    // Ne touche plus à la salle : la salle est gérée depuis la page Planification
    public Reunion update(Long id, Reunion updated) {
        Reunion reunion = reunionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reunion not found with id: " + id));

        reunion.setTitre(updated.getTitre());
        reunion.setDate(updated.getDate());
        reunion.setHeureDeDebut(updated.getHeureDeDebut());
        reunion.setHeureDeFin(updated.getHeureDeFin());

        return reunionRepository.save(reunion);
    }

    public void delete(Long id) {
        reunionRepository.deleteById(id);
    }

    // ---- Planification : associer une salle à une réunion ----

    public Reunion setSalle(Long reunionId, Long salleId) {
        Reunion reunion = reunionRepository.findById(reunionId)
                .orElseThrow(() -> new RuntimeException("Reunion not found with id: " + reunionId));

        if (salleId == null) {
            reunion.setSalle(null);
        } else {
            Salle salle = salleRepository.findById(salleId)
                    .orElseThrow(() -> new RuntimeException("Salle not found with id: " + salleId));
            reunion.setSalle(salle);
        }

        return reunionRepository.save(reunion);
    }

    // ---- Gestion des participants d'une réunion ----

    public List<Participant> getParticipants(Long reunionId) {
        return participantRepository.findByReunions_Id(reunionId);
    }

    // Crée un NOUVEAU participant et le lie directement à la réunion
    public Participant addParticipant(Long reunionId, Participant data) {
        Reunion reunion = reunionRepository.findById(reunionId)
                .orElseThrow(() -> new RuntimeException("Reunion not found with id: " + reunionId));

        Participant participant = new Participant();
        participant.setNom(data.getNom());
        participant.setPrenom(data.getPrenom());
        participant.setCin(data.getCin());
        participant.setPresence(false);
        participant.getReunions().add(reunion);

        return participantRepository.save(participant);
    }

    // Lie un participant EXISTANT (choisi dans la liste) à la réunion
    public void linkExistingParticipant(Long reunionId, Long participantId) {
        Reunion reunion = reunionRepository.findById(reunionId)
                .orElseThrow(() -> new RuntimeException("Reunion not found with id: " + reunionId));
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found with id: " + participantId));

        boolean alreadyLinked = participant.getReunions().stream()
                .anyMatch(r -> r.getId().equals(reunionId));

        if (!alreadyLinked) {
            participant.getReunions().add(reunion);
            participantRepository.save(participant);
        }
    }

    public void removeParticipant(Long reunionId, Long participantId) {
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found with id: " + participantId));

        participant.getReunions().removeIf(r -> r.getId().equals(reunionId));
        participantRepository.save(participant);
    }

    public Participant updatePresence(Long participantId, boolean presence) {
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found with id: " + participantId));

        participant.setPresence(presence);
        return participantRepository.save(participant);
    }
    public void clearPlanification(Long reunionId) {
        Reunion reunion = reunionRepository.findById(reunionId)
                .orElseThrow(() -> new RuntimeException("Reunion not found with id: " + reunionId));

        reunion.setSalle(null);
        reunionRepository.save(reunion);

        List<Participant> participants = participantRepository.findByReunions_Id(reunionId);
        for (Participant p : participants) {
            p.getReunions().removeIf(r -> r.getId().equals(reunionId));
            participantRepository.save(p);
        }
    }
}