package com.estatehub.entity;

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
@Table(name = "tenancies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenancy {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "tenancy_id", updatable = false, nullable = false)
    private UUID tenancyId;

    @Column(name = "property_id", nullable = false)
    private UUID propertyId;

    @Column(name = "agreement_id", nullable = false)
    private UUID agreementId;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "monthly_rent", nullable = false, precision = 12, scale = 2)
    private BigDecimal monthlyRent;

    // Between 1 and 28 inclusive, per Appendix C validation rule
    @Column(name = "rent_due_day", nullable = false)
    private Integer rentDueDay;

    @Column(name = "grace_period_days")
    @Builder.Default
    private Integer gracePeriodDays = 5;

    @Column(name = "late_fee_flat", precision = 8, scale = 2)
    private BigDecimal lateFeeFlat;

    @Column(name = "late_fee_percent", precision = 5, scale = 2)
    private BigDecimal lateFeePercent;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
