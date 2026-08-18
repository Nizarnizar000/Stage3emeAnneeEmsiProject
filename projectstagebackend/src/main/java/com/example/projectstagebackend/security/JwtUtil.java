package com.example.projectstagebackend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    // AVANT : la clé était générée aléatoirement à chaque démarrage
    // (Keys.secretKeyFor(SignatureAlgorithm.HS256)), donc TOUS les tokens
    // déjà distribués devenaient invalides à chaque redémarrage du serveur
    // (tout le monde était déconnecté). On lit maintenant une clé secrète
    // fixe et persistante depuis application.properties (jwt.secret).
    @Value("${jwt.secret}")
    private String secretBase64;

    private SecretKey key;

    private SecretKey getKey() {
        if (key == null) {
            key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretBase64));
        }
        return key;
    }

    private final long EXPIRATION_MS = 1000 * 60 * 60 * 10; // 10 hours

    public String generateToken(String email, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(getKey())
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser().verifyWith(getKey()).build()
                .parseSignedClaims(token).getPayload().getSubject();
    }

    public String extractRole(String token) {
        return (String) Jwts.parser().verifyWith(getKey()).build()
                .parseSignedClaims(token).getPayload().get("role");
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parser().verifyWith(getKey()).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}