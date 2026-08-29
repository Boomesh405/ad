package com.estatehub.entity;

import com.estatehub.entity.enums.ListingStatus;
import com.estatehub.entity.enums.ListingType;
import com.estatehub.entity.enums.PossessionStatus;
import com.estatehub.entity.enums.PropertyType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "properties")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "property_id", updatable = false, nullable = false)
    private UUID propertyId;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "agent_id")
    private UUID agentId;

    @NotBlank
    @Column(name = "title", length = 200, nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "property_type", nullable = false, length = 30)
    private PropertyType propertyType;

    @Enumerated(EnumType.STRING)
    @Column(name = "listing_type", nullable = false, length = 20)
    @Builder.Default
    private ListingType listingType = ListingType.FOR_SALE;

    @Column(name = "bhk_config", length = 20)
    private String bhkConfig;

    @Positive
    @Column(name = "carpet_area_sqft", nullable = false)
    private Double carpetAreaSqft;

    @Column(name = "built_up_area_sqft")
    private Double builtUpAreaSqft;

    @Column(name = "floor_number")
    private Integer floorNumber;

    @Column(name = "total_floors")
    private Integer totalFloors;

    @Positive
    @Column(name = "price", nullable = false, precision = 14, scale = 2)
    private BigDecimal price;

    @Column(name = "monthly_rent", precision = 12, scale = 2)
    private BigDecimal monthlyRent;

    @Column(name = "price_per_sqft", precision = 10, scale = 2)
    private BigDecimal pricePerSqft;

    @Column(name = "negotiable")
    @Builder.Default
    private boolean negotiable = false;

    @Column(name = "maintenance_charges", precision = 10, scale = 2)
    private BigDecimal maintenanceCharges;

    @Column(name = "address", length = 300)
    private String address;

    @Column(name = "pincode", length = 10)
    private String pincode;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "landmark", length = 200)
    private String landmark;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @ElementCollection
    @CollectionTable(name = "property_amenities", joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "amenity")
    private java.util.List<String> amenities;

    // Photo/video gallery from property_media. Eager so the API returns media
    // with every property (search cards + detail page) without extra lookups.
    @OneToMany(fetch = FetchType.EAGER)
    @JoinColumn(name = "property_id")
    private List<PropertyMedia> media = new ArrayList<>();

    // Owner-uploaded documents (title deed, tax receipt, floor plan, etc.)
    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id")
    @Builder.Default
    private List<PropertyDocument> documents = new ArrayList<>();

    // Mandatory for under-construction listings per RERA Act 2016 (SRS 2.5, Appendix C)
    @Column(name = "rera_number", length = 50)
    private String reraNumber;

    @Column(name = "project_completion_date")
    private LocalDate projectCompletionDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "possession_status", nullable = false, length = 30)
    private PossessionStatus possessionStatus;

    @Column(name = "possession_date")
    private LocalDate possessionDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "listing_status", nullable = false, length = 30)
    @Builder.Default
    private ListingStatus listingStatus = ListingStatus.PENDING_APPROVAL;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "view_count")
    @Builder.Default
    private Long viewCount = 0L;

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
