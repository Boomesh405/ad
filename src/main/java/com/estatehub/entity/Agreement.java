package com.estatehub.entity;

import com.estatehub.entity.enums.AgreementStatus;
import com.estatehub.entity.enums.AgreementType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "agreements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Agreement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "agreement_id", updatable = false, nullable = false)
    private UUID agreementId;

    @Column(name = "property_id", nullable = false)
    private UUID propertyId;

    @Enumerated(EnumType.STRING)
    @Column(name = "agreement_type", nullable = false, length = 20)
    private AgreementType agreementType;

    @Column(name = "parties", columnDefinition = "TEXT")
    private String parties; // JSON: buyer/seller/tenant party details

    @Column(name = "consideration_amount", precision = 14, scale = 2)
    private BigDecimal considerationAmount;

    @Column(name = "possession_date")
    private LocalDate possessionDate;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private AgreementStatus status = AgreementStatus.DRAFT;

    @Column(name = "digio_document_id", length = 100)
    private String digioDocumentId;

    @Column(name = "signed_document_s3_key", length = 500)
    private String signedDocumentS3Key;

    @Column(name = "parent_agreement_id")
    private UUID parentAgreementId; // for addendum linking

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
