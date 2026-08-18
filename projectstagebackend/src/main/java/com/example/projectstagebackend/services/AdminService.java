package com.example.projectstagebackend.services;

import com.example.projectstagebackend.model.Admin;
import com.example.projectstagebackend.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AdminRepository adminRepository;

    public List<Admin> getAll() {
        return adminRepository.findAll();
    }

    public Optional<Admin> getById(Long id) {
        return adminRepository.findById(id);
    }

    public List<Admin> getByNom(String nom) {
        return adminRepository.findByNom(nom);
    }

    public Admin save(Admin admin) {

        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        admin.setRole("ADMIN");
        return adminRepository.save(admin);
    }

    public Admin update(Long id, Admin updated) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));

        admin.setNom(updated.getNom());
        admin.setPrenom(updated.getPrenom());
        admin.setEmail(updated.getEmail());
        if (updated.getPassword() != null && !updated.getPassword().isBlank()) {
            admin.setPassword(passwordEncoder.encode(updated.getPassword()));
        }
        admin.setRole(updated.getRole());

        return adminRepository.save(admin);
    }

    public void delete(Long id) {
        adminRepository.deleteById(id);
    }
}
