package com.estatehub.controller;

import com.estatehub.entity.MaintenanceTicket;
import com.estatehub.entity.enums.TicketStatus;
import com.estatehub.repository.MaintenanceTicketRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

// FR8: Maintenance Ticketing
@RestController
@RequestMapping("/api/v1/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceTicketRepository ticketRepository;

    @PostMapping
    @PreAuthorize("hasRole('BUYER_TENANT')")
    public ResponseEntity<MaintenanceTicket> raise(@Valid @RequestBody MaintenanceTicket ticket) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketRepository.save(ticket));
    }

    @GetMapping("/property/{propertyId}")
    @PreAuthorize("hasAnyRole('BUILDER_OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<List<MaintenanceTicket>> byProperty(@PathVariable UUID propertyId) {
        return ResponseEntity.ok(ticketRepository.findByPropertyId(propertyId));
    }

    @PatchMapping("/{id}/assign-contractor")
    @PreAuthorize("hasRole('BUILDER_OWNER')")
    public ResponseEntity<MaintenanceTicket> assignContractor(@PathVariable UUID id,
                                                                @RequestParam String contractorName,
                                                                @RequestParam String contractorMobile) {
        MaintenanceTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new com.estatehub.exception.ResourceNotFoundException("Ticket not found"));
        ticket.setContractorName(contractorName);
        ticket.setContractorMobile(contractorMobile);
        ticket.setStatus(TicketStatus.CONTRACTOR_ASSIGNED);
        return ResponseEntity.ok(ticketRepository.save(ticket));
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('BUILDER_OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<MaintenanceTicket> resolve(@PathVariable UUID id) {
        MaintenanceTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new com.estatehub.exception.ResourceNotFoundException("Ticket not found"));
        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolutionDate(java.time.LocalDate.now());
        return ResponseEntity.ok(ticketRepository.save(ticket));
    }
}
