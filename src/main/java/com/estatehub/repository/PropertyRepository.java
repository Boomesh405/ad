package com.estatehub.repository;

import com.estatehub.entity.Property;
import com.estatehub.entity.enums.ListingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PropertyRepository extends JpaRepository<Property, UUID>, JpaSpecificationExecutor<Property> {
    List<Property> findByOwnerId(UUID ownerId);
    List<Property> findByAgentId(UUID agentId);
    Page<Property> findByListingStatus(ListingStatus status, Pageable pageable);
    List<Property> findByListingStatusOrderByCreatedAtDesc(ListingStatus status);
    List<Property> findAllByOrderByCreatedAtDesc();
    List<Property> findByCityIgnoreCaseAndListingStatus(String city, ListingStatus status);
}
