package com.estatehub.repository;

import com.estatehub.entity.PropertyMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PropertyMediaRepository extends JpaRepository<PropertyMedia, UUID> {
    List<PropertyMedia> findByPropertyIdOrderByDisplayOrderAsc(UUID propertyId);
    long countByPropertyId(UUID propertyId);
}
