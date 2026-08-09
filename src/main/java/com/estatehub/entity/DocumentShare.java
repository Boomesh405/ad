package com.estatehub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

// Access control: owner shares a document with a specific buyer via time-limited signed URL (SRS FR9)
@Entity
@Table(name = "document_shares")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentShare {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "share_id", updatable = false, nullable = false)
    private UUID shareId;

    @Column(name = "doc_id", nullable = false)
    private UUID docId;

    @Column(name = "shared_with_email", length = 150, nullable = false)
    private String sharedWithEmail;

    @Column(name = "shared_by_user_id", nullable = false)
    private UUID sharedByUserId;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
