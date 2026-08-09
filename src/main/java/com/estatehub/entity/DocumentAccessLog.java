package com.estatehub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

// Audit log: every document access (view/download) logged with user, IP, timestamp (SRS FR9)
@Entity
@Table(name = "document_access_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentAccessLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "log_id", updatable = false, nullable = false)
    private UUID logId;

    @Column(name = "doc_id", nullable = false)
    private UUID docId;

    @Column(name = "accessed_by_user_id")
    private UUID accessedByUserId;

    @Column(name = "action", length = 20, nullable = false)
    private String action; // VIEW / DOWNLOAD

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "accessed_at", nullable = false, updatable = false)
    private LocalDateTime accessedAt;

    @PrePersist
    protected void onCreate() {
        accessedAt = LocalDateTime.now();
    }
}
