package com.example.projectstagebackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "participant")
@Getter
@Setter
@NoArgsConstructor
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    private String prenom;

    private String cin;

    private boolean presence;


    @ManyToMany(mappedBy = "participants")
    @JsonIgnore
    private List<ResponsableDePlanification> responsables;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    @JsonIgnore
    private Admin admin;

    @ManyToMany
    @JoinTable(
            name = "participants_reunion",
            joinColumns = @JoinColumn(name = "participant_id"),
            inverseJoinColumns = @JoinColumn(name = "reunion_id")
    )
    @JsonIgnore
    private List<Reunion> reunions = new ArrayList<>();
}