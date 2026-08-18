package com.example.projectstagebackend.controller;

import com.example.projectstagebackend.model.Participant;
import com.example.projectstagebackend.model.Reunion;
import com.example.projectstagebackend.services.ReunionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reunions")
public class ReunionController {

    @Autowired
    private ReunionService reunionService;

    @GetMapping
    public List<Reunion> getAll() {
        return reunionService.getAll();
    }

    // Endpoint public utilisé par le calendrier participant
    @GetMapping("/public")
    public List<Reunion> getPublicReunions() {
        return reunionService.getAll();
    }

    // Endpoint public : liste des participants d'une réunion (popup calendrier)
    @GetMapping("/public/{id}/participants")
    public List<Participant> getPublicParticipants(@PathVariable Long id) {
        return reunionService.getParticipants(id);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reunion> getById(@PathVariable Long id) {
        Optional<Reunion> reunion = reunionService.getById(id);
        return reunion.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<Reunion> getByTitre(@RequestParam String titre) {
        return reunionService.getByTitre(titre);
    }

    @PostMapping
    public Reunion create(@RequestBody Reunion reunion) {
        return reunionService.save(reunion);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reunion> update(@PathVariable Long id, @RequestBody Reunion reunion) {
        try {
            return ResponseEntity.ok(reunionService.update(id, reunion));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reunionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Planification : salle d'une réunion ----

    @PutMapping("/{id}/salle")
    public ResponseEntity<Reunion> setSalle(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        try {
            return ResponseEntity.ok(reunionService.setSalle(id, body.get("salleId")));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ---- Participants d'une réunion ----

    @GetMapping("/{id}/participants")
    public List<Participant> getParticipants(@PathVariable Long id) {
        return reunionService.getParticipants(id);
    }

    @PostMapping("/{id}/participants")
    public ResponseEntity<Participant> addParticipant(@PathVariable Long id, @RequestBody Participant participant) {
        try {
            return ResponseEntity.ok(reunionService.addParticipant(id, participant));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/participants/{participantId}")
    public ResponseEntity<Void> linkParticipant(@PathVariable Long id, @PathVariable Long participantId) {
        try {
            reunionService.linkExistingParticipant(id, participantId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}/participants/{participantId}")
    public ResponseEntity<Void> removeParticipant(@PathVariable Long id, @PathVariable Long participantId) {
        try {
            reunionService.removeParticipant(id, participantId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/participants/{participantId}/presence")
    public ResponseEntity<Participant> updatePresence(@PathVariable Long id, @PathVariable Long participantId, @RequestBody Map<String, Boolean> body) {
        try {
            boolean presence = Boolean.TRUE.equals(body.get("presence"));
            return ResponseEntity.ok(reunionService.updatePresence(participantId, presence));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    @DeleteMapping("/{id}/planification")
    public ResponseEntity<Void> clearPlanification(@PathVariable Long id) {
        try {
            reunionService.clearPlanification(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}