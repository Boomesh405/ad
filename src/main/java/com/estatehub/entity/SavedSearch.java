package com.estatehub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "saved_searches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedSearch {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "search_id", updatable = false, nullable = false)
    private UUID searchId;

    @Column(name = "buyer_id", nullable = false)
    private UUID buyerId;

    // The DB column is JSONB (V1__init_schema.sql); bind the String as JSON so
    // Hibernate ddl-auto validate accepts the mapping and writes are valid JSON.
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "search_criteria", columnDefinition = "jsonb", nullable = false)
    private String searchCriteria;

    @Column(name = "last_notified_at")
    private LocalDateTime lastNotifiedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
