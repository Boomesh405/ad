package com.estatehub.repository;

import com.estatehub.entity.PropertyDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PropertyDocumentRepository extends JpaRepository<PropertyDocument, UUID> {
    List<PropertyDocument> findByPropertyId(UUID propertyId);
}
