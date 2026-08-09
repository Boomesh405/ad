package com.estatehub.repository;

import com.estatehub.entity.RentInvoice;
import com.estatehub.entity.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RentInvoiceRepository extends JpaRepository<RentInvoice, UUID> {
    List<RentInvoice> findByTenancyIdOrderByInvoiceDateDesc(UUID tenancyId);
    List<RentInvoice> findByStatus(InvoiceStatus status);
}
