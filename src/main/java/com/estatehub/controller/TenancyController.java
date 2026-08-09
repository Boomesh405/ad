package com.estatehub.controller;

import com.estatehub.entity.RentInvoice;
import com.estatehub.entity.Tenancy;
import com.estatehub.service.RentInvoiceService;
import com.estatehub.service.TenancyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

// FR7: Rental Management
@RestController
@RequestMapping("/api/v1/tenancies")
@RequiredArgsConstructor
public class TenancyController {

    private final TenancyService tenancyService;
    private final RentInvoiceService rentInvoiceService;

    // Tenancies are created by the system once a rent agreement is EXECUTED (SRS Appendix H.2);
    // restricted to builder owners (landlords) and admins - tenants cannot create tenancies.
    @PostMapping
    @PreAuthorize("hasAnyRole('BUILDER_OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<Tenancy> create(@Valid @RequestBody Tenancy tenancy) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tenancyService.createTenancy(tenancy));
    }

    @GetMapping("/{id}/invoices")
    @PreAuthorize("hasAnyRole('BUILDER_OWNER', 'BUYER_TENANT', 'SUPER_ADMIN')")
    public ResponseEntity<List<RentInvoice>> invoices(@PathVariable UUID id) {
        return ResponseEntity.ok(rentInvoiceService.getLedger(id));
    }

    @PostMapping("/{id}/invoices/{invoiceId}/pay")
    @PreAuthorize("hasRole('BUYER_TENANT')")
    public ResponseEntity<RentInvoice> pay(@PathVariable UUID id, @PathVariable UUID invoiceId) {
        return ResponseEntity.ok(rentInvoiceService.markPaid(invoiceId));
    }
}
