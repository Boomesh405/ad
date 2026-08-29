package com.estatehub.service;

import com.estatehub.dto.PropertySearchCriteria;
import com.estatehub.dto.DocumentUploadRequest;
import com.estatehub.entity.Property;
import com.estatehub.entity.PropertyDocument;
import com.estatehub.entity.User;
import com.estatehub.entity.enums.ListingStatus;
import com.estatehub.entity.enums.PossessionStatus;
import com.estatehub.entity.enums.Role;
import com.estatehub.exception.AgentKycIncompleteException;
import com.estatehub.exception.InsufficientPhotosException;
import com.estatehub.exception.ReraRequiredException;
import com.estatehub.exception.ResourceNotFoundException;
import com.estatehub.repository.PropertyDocumentRepository;
import com.estatehub.repository.PropertyMediaRepository;
import com.estatehub.repository.PropertyRepository;
import com.estatehub.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private static final int MIN_PHOTOS_TO_ACTIVATE = 3; // Appendix C validation rule

    private final PropertyRepository propertyRepository;
    private final PropertyMediaRepository propertyMediaRepository;
    private final PropertyDocumentRepository propertyDocumentRepository;
    private final UserRepository userRepository;

    @Transactional
    public Property createListing(Property property, UUID creatorUserId) {
        User creator = userRepository.findById(creatorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // AgentKycIncompleteException - unverified agent attempting to list (Appendix D, HTTP 403)
        if (creator.getRole() == Role.AGENT && !creator.isKycVerified()) {
            throw new AgentKycIncompleteException("Agent KYC incomplete — cannot create listings");
        }

        // ReraRequiredException - under-construction listing without RERA number (Appendix D, HTTP 400)
        if (property.getPossessionStatus() == PossessionStatus.UNDER_CONSTRUCTION
                && (property.getReraNumber() == null || property.getReraNumber().isBlank())) {
            throw new ReraRequiredException("RERA registration number required for under-construction properties");
        }

        property.setOwnerId(creatorUserId);
        property.setListingStatus(ListingStatus.PENDING_APPROVAL);
        return propertyRepository.save(property);
    }

    @Transactional
    public Property activateListing(UUID propertyId, UUID actorUserId, boolean isAdmin) {
        Property property = getById(propertyId);

        // Ownership check: owners/agents may only activate their own listings (SRS 5.3)
        if (!isAdmin && !property.getOwnerId().equals(actorUserId)
                && (property.getAgentId() == null || !property.getAgentId().equals(actorUserId))) {
            throw new AccessDeniedException("You can only activate your own listings");
        }

        // InsufficientPhotosException - listing activation with fewer than 3 photos (Appendix D, HTTP 400)
        long photoCount = propertyMediaRepository.countByPropertyId(propertyId);
        if (photoCount < MIN_PHOTOS_TO_ACTIVATE) {
            throw new InsufficientPhotosException("Minimum 3 photos required to activate listing");
        }

        property.setListingStatus(ListingStatus.ACTIVE);
        return propertyRepository.save(property);
    }

    @Transactional
    public Property approveListing(UUID propertyId) {
        Property property = getById(propertyId);
        property.setListingStatus(ListingStatus.ACTIVE);
        return propertyRepository.save(property);
    }

    @Transactional
    public Property rejectListing(UUID propertyId, String reason) {
        Property property = getById(propertyId);
        property.setListingStatus(ListingStatus.REJECTED);
        property.setRejectionReason(reason);
        return propertyRepository.save(property);
    }

    @Transactional(readOnly = true)
    public Property getById(UUID propertyId) {
        return propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found: " + propertyId));
    }

    /**
     * Whether the user owns the property or manages it as its listing agent.
     * Used by controllers/services for ownership-based authorization.
     */
    /**
     * Admin console: all listings, optionally filtered by status (e.g. PENDING_APPROVAL).
     * Only exposed via AdminController (SUPER_ADMIN only).
     */
    @Transactional(readOnly = true)
    public List<Property> listForAdmin(ListingStatus status) {
        return status == null
                ? propertyRepository.findAllByOrderByCreatedAtDesc()
                : propertyRepository.findByListingStatusOrderByCreatedAtDesc(status);
    }

    @Transactional(readOnly = true)
    public boolean isOwnerOrAgent(UUID propertyId, UUID userId) {
        return propertyRepository.findById(propertyId)
                .map(p -> p.getOwnerId().equals(userId)
                        || (p.getAgentId() != null && p.getAgentId().equals(userId)))
                .orElse(false);
    }

    @Transactional
    public Property recordView(UUID propertyId) {
        Property property = getById(propertyId);
        property.setViewCount(property.getViewCount() + 1);
        return propertyRepository.save(property);
    }

    @Transactional
    public PropertyDocument uploadDocument(UUID propertyId, UUID userId, DocumentUploadRequest request) {
        Property property = getById(propertyId);

        // Only the owner or listing agent can upload documents
        if (!property.getOwnerId().equals(userId)
                && (property.getAgentId() == null || !property.getAgentId().equals(userId))) {
            throw new AccessDeniedException("Only the property owner or agent can upload documents");
        }

        PropertyDocument doc = PropertyDocument.builder()
                .propertyId(propertyId)
                .uploadedBy(userId)
                .docType(request.getDocType())
                .docName(request.getDocName())
                .fileUrl(request.getFileUrl())
                .fileSizeBytes(request.getFileSizeBytes())
                .verified(false)
                .build();
        return propertyDocumentRepository.save(doc);
    }

    @Transactional(readOnly = true)
    public List<PropertyDocument> getDocuments(UUID propertyId) {
        // Verify property exists
        getById(propertyId);
        return propertyDocumentRepository.findByPropertyIdOrderByCreatedAtAsc(propertyId);
    }

    @Transactional(readOnly = true)
    public Page<Property> search(PropertySearchCriteria criteria) {
        Specification<Property> spec = buildSpecification(criteria);
        Sort sort = resolveSort(criteria.getSortBy());
        Pageable pageable = PageRequest.of(criteria.getPage(), criteria.getSize(), sort);
        return propertyRepository.findAll(spec, pageable);
    }

    private Specification<Property> buildSpecification(PropertySearchCriteria c) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("listingStatus"), ListingStatus.ACTIVE));

            if (c.getKeyword() != null && !c.getKeyword().isBlank()) {
                String like = "%" + c.getKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), like),
                        cb.like(cb.lower(root.get("city")), like),
                        cb.like(cb.lower(root.get("landmark")), like)
                ));
            }
            if (c.getPropertyType() != null) {
                predicates.add(cb.equal(root.get("propertyType"), c.getPropertyType()));
            }
            if (c.getBhkConfig() != null) {
                predicates.add(cb.equal(root.get("bhkConfig"), c.getBhkConfig()));
            }
            if (c.getMinPrice() != null) {
                predicates.add(cb.ge(root.get("price"), c.getMinPrice()));
            }
            if (c.getMaxPrice() != null) {
                predicates.add(cb.le(root.get("price"), c.getMaxPrice()));
            }
            if (c.getMinCarpetArea() != null) {
                predicates.add(cb.ge(root.get("carpetAreaSqft"), c.getMinCarpetArea()));
            }
            if (c.getMaxCarpetArea() != null) {
                predicates.add(cb.le(root.get("carpetAreaSqft"), c.getMaxCarpetArea()));
            }
            if (c.getPossessionStatus() != null) {
                predicates.add(cb.equal(root.get("possessionStatus"), c.getPossessionStatus()));
            }
            if (c.getListingType() != null) {
                predicates.add(cb.equal(root.get("listingType"), c.getListingType()));
            }
            if (c.getCity() != null && !c.getCity().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("city")), c.getCity().toLowerCase()));
            }
            if (c.getPincode() != null && !c.getPincode().isBlank()) {
                predicates.add(cb.equal(root.get("pincode"), c.getPincode()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Sort resolveSort(String sortBy) {
        if (sortBy == null) return Sort.by(Sort.Direction.DESC, "createdAt");
        return switch (sortBy) {
            case "PRICE_ASC" -> Sort.by(Sort.Direction.ASC, "price");
            case "PRICE_DESC" -> Sort.by(Sort.Direction.DESC, "price");
            case "AREA" -> Sort.by(Sort.Direction.DESC, "carpetAreaSqft");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }
}
