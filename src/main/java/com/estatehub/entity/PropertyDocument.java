package com.estatehub.entity;

import com.estatehub.entity.enums.DocumentType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "property_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "doc_id", updatable = false, nullable = false)
    private UUID docId;

    @Column(name = "property_id", nullable = false)
    private UUID propertyId;

    @Enumerated(EnumType.STRING)
    @Column(name = "doc_type", nullable = false, length = 50)
    private DocumentType docType;

    @Column(name = "s3_key", length = 500, nullable = false)
    private String s3Key;

    @Column(name = "verified")
    @Builder.Default
    private boolean verified = false;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "version")
    @Builder.Default
    private Integer version = 1;

    @Column(name = "previous_version_doc_id")
    private UUID previousVersionDocId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
