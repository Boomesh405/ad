package com.estatehub.config;

import com.estatehub.entity.enums.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * JWT issuance/parsing using HS512, per SRS Appendix D (Security Configuration).
 * Access token expiry: 1 hour. Refresh token rotation on use.
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-token-expiry-ms}")
    private long accessTokenExpiryMs;

    @Value("${jwt.refresh-token-expiry-ms}")
    private long refreshTokenExpiryMs;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(String subject, String role, String userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("uid", userId);
        return buildToken(claims, subject, accessTokenExpiryMs);
    }

    public String generateRefreshToken(String subject, String userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("uid", userId);
        claims.put("type", "refresh");
        return buildToken(claims, subject, refreshTokenExpiryMs);
    }

    private String buildToken(Map<String, Object> claims, String subject, long expiryMs) {
        Date now = new Date();
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expiryMs))
                .signWith(key(), SignatureAlgorithm.HS512)
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractSubject(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return (String) extractAllClaims(token).get("role");
    }

    public String extractUserId(String token) {
        return (String) extractAllClaims(token).get("uid");
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Authenticated principal resolved from the signed JWT (subject, role and uid claims).
     * Never derived from client-supplied headers or body fields (SRS 5.3).
     */
    public record CurrentUser(UUID userId, String mobile, Role role) {

        public boolean isSuperAdmin() {
            return role == Role.SUPER_ADMIN;
        }
    }
}
