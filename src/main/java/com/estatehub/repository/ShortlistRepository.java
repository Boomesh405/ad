package com.estatehub.repository;

import com.estatehub.entity.Shortlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShortlistRepository extends JpaRepository<Shortlist, UUID> {
    List<Shortlist> findByBuyerId(UUID buyerId);
    Optional<Shortlist> findByBuyerIdAndPropertyId(UUID buyerId, UUID propertyId);
}
