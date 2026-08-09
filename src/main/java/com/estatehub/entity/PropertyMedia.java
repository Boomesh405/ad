package com.estatehub.entity;

import com.estatehub.entity.enums.MediaType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "property_media")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "media_id", updatable = false, nullable = false)
    private UUID mediaId;

    @Column(name = "property_id", nullable = false)
    private UUID propertyId;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 30)
    private MediaType mediaType;

    @Column(name = "s3_key", length = 500, nullable = false)
    private String s3Key;

    @Column(name = "alt_text", length = 200)
    private String altText;

    @Column(name = "is_cover_photo")
    @Builder.Default
    private boolean coverPhoto = false;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "external_video_url", length = 500)
    private String externalVideoUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
