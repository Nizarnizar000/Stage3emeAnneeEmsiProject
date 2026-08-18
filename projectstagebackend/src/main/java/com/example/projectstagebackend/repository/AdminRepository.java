package com.example.projectstagebackend.repository;

import com.example.projectstagebackend.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    List<Admin> findByNom(String nom);
}
