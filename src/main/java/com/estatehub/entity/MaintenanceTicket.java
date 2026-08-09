package com.estatehub.entity;

import com.estatehub.entity.enums.TicketCategory;
import com.estatehub.entity.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "maintenance_tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ticket_id", updatable = false, nullable = false)
    private UUID ticketId;

    @Column(name = "property_id", nullable = false)
    private UUID propertyId;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private TicketCategory category;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @ElementCollection
    @CollectionTable(name = "ticket_photos", joinColumns = @JoinColumn(name = "ticket_id"))
    @Column(name = "s3_key")
    private List<String> photosS3Keys;

    @Column(name = "contractor_name", length = 100)
    private String contractorName;

    @Column(name = "contractor_mobile", length = 15)
    private String contractorMobile;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    @Column(name = "resolution_date")
    private LocalDate resolutionDate;

    @Column(name = "cost", precision = 8, scale = 2)
    private BigDecimal cost;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
