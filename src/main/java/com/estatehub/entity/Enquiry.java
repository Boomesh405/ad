package com.estatehub.entity;

import com.estatehub.entity.enums.LeadStage;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "enquiries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "enquiry_id", updatable = false, nullable = false)
    private UUID enquiryId;

    @Column(name = "property_id", nullable = false)
    private UUID propertyId;

    @Column(name = "agent_id")
    private UUID agentId;

    @NotBlank
    @Column(name = "buyer_name", length = 100, nullable = false)
    private String buyerName;

    @NotBlank
    @Column(name = "buyer_mobile", length = 15, nullable = false)
    private String buyerMobile;

    @Column(name = "otp_verified")
    @Builder.Default
    private boolean otpVerified = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage", nullable = false, length = 30)
    @Builder.Default
    private LeadStage stage = LeadStage.NEW;

    @Column(name = "lead_score")
    @Builder.Default
    private Integer leadScore = 0;

    @Column(name = "site_visit_slot")
    private LocalDateTime siteVisitSlot;

    @Column(name = "lost_reason", length = 300)
    private String lostReason;

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
