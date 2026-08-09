package com.estatehub.repository;

import com.estatehub.entity.Tenancy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenancyRepository extends JpaRepository<Tenancy, UUID> {
    List<Tenancy> findByPropertyIdAndActiveTrue(UUID propertyId);
    Optional<Tenancy> findByTenantIdAndActiveTrue(UUID tenantId);
    List<Tenancy> findByPropertyId(UUID propertyId);
}
