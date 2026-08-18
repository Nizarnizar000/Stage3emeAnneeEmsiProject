package com.example.projectstagebackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "reunion")
@Getter
@Setter
@NoArgsConstructor
public class Reunion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;

    private LocalDate date;

    @Column(name = "heure_de_debut")
    private LocalDateTime heureDeDebut;

    @Column(name = "heure_de_fin")
    private LocalDateTime heureDeFin;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    @JsonIgnore
    private Admin admin;

    @ManyToOne
    @JoinColumn(name = "salle_id")
    private Salle salle;

    @ManyToMany(mappedBy = "reunions")
    @JsonIgnore
    private List<ResponsableDePlanification> responsables;

    @ManyToMany(mappedBy = "reunions")
    @JsonIgnore
    private List<Participant> participants;


}
