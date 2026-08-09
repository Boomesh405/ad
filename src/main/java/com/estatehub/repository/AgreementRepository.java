package com.estatehub.repository;

import com.estatehub.entity.Agreement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AgreementRepository extends JpaRepository<Agreement, UUID> {
    List<Agreement> findByPropertyId(UUID propertyId);
    Optional<Agreement> findByDigioDocumentId(String digioDocumentId);
}
