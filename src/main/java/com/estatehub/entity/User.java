package com.estatehub.entity;

import com.estatehub.entity.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id", updatable = false, nullable = false)
    private UUID userId;

    @NotBlank
    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @NotBlank
    @Column(name = "mobile", length = 15, nullable = false, unique = true)
    private String mobile;

    @Email
    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private Role role;

    // Agent KYC fields - mandatory before agent activation (SRS 2.5, FR12)
    @Column(name = "aadhaar_encrypted")
    private String aadhaarEncrypted;

    @Column(name = "pan_encrypted")
    private String panEncrypted;

    @Column(name = "kyc_verified", nullable = false)
    @Builder.Default
    private boolean kycVerified = false;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
