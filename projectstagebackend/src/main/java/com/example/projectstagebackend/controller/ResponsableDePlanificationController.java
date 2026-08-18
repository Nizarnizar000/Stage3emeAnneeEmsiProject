package com.example.projectstagebackend.controller;

import com.example.projectstagebackend.model.ResponsableDePlanification;
import com.example.projectstagebackend.services.ResponsableDePlanificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/responsables")
public class ResponsableDePlanificationController {

    @Autowired
    private ResponsableDePlanificationService responsableService;

    @GetMapping
    public List<ResponsableDePlanification> getAll() {
        return responsableService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponsableDePlanification> getById(@PathVariable Long id) {
        Optional<ResponsableDePlanification> responsable = responsableService.getById(id);
        return responsable.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<ResponsableDePlanification> getByNom(@RequestParam String nom) {
        return responsableService.getByNom(nom);
    }

    @PostMapping
    public ResponsableDePlanification create(@RequestBody ResponsableDePlanification responsable) {
        return responsableService.save(responsable);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponsableDePlanification> update(@PathVariable Long id, @RequestBody ResponsableDePlanification responsable) {
        try {
            return ResponseEntity.ok(responsableService.update(id, responsable));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        responsableService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
