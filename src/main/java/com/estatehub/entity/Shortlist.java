package com.estatehub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

// Junction table: buyer shortlists a property (SRS FR2). Missing from Appendix B - added to close the gap.
@Entity
@Table(name = "shortlists", uniqueConstraints = @UniqueConstraint(columnNames = {"buyer_id", "property_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shortlist {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "shortlist_id", updatable = false, nullable = false)
    private UUID shortlistId;

    @Column(name = "buyer_id", nullable = false)
    private UUID buyerId;

    @Column(name = "property_id", nullable = false)
    private UUID propertyId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
