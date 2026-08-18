package com.example.projectstagebackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "responsable_de_planification")
@Getter
@Setter
@NoArgsConstructor
public class ResponsableDePlanification extends Utilisateur {

    @ManyToMany
    @JoinTable(
        name = "responsable_reunion",
        joinColumns = @JoinColumn(name = "responsable_id"),
        inverseJoinColumns = @JoinColumn(name = "reunion_id")
    )
    @JsonIgnore
    private List<Reunion> reunions;

    @ManyToMany
    @JoinTable(
            name = "responsable_salle",
            joinColumns = @JoinColumn(name = "responsable_id"),
            inverseJoinColumns = @JoinColumn(name = "salle_id")
    )
    @JsonIgnore
    private List<Salle> salles;

    @ManyToMany
    @JoinTable(
            name = "responsable_participants",
            joinColumns = @JoinColumn(name = "responsable_id"),
            inverseJoinColumns = @JoinColumn(name = "participant_id")
    )
    @JsonIgnore
    private List<Participant> participants;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    @JsonIgnore
    private Admin admin;
}
