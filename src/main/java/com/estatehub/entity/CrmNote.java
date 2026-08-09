package com.estatehub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "crm_notes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmNote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "note_id", updatable = false, nullable = false)
    private UUID noteId;

    @Column(name = "enquiry_id", nullable = false)
    private UUID enquiryId;

    @Column(name = "agent_id", nullable = false)
    private UUID agentId;

    @Column(name = "note_text", columnDefinition = "TEXT", nullable = false)
    private String noteText;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @Column(name = "follow_up_mode", length = 20)
    private String followUpMode; // CALL / WHATSAPP / EMAIL

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
