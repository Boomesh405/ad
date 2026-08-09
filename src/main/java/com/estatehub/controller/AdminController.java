package com.estatehub.controller;

import com.estatehub.entity.Property;
import com.estatehub.entity.enums.ListingStatus;
import com.estatehub.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

// FR12: Admin and Compliance Management - Admin only
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AdminController {

    private final PropertyService propertyService;

    // FR12: Admin console - list all listings (optionally by status, e.g. PENDING_APPROVAL)
    @GetMapping("/properties")
    public ResponseEntity<List<Property>> listProperties(
            @RequestParam(required = false) ListingStatus status) {
        return ResponseEntity.ok(propertyService.listForAdmin(status));
    }

    @PutMapping("/properties/{id}/approve")
    public ResponseEntity<Property> approveListing(@PathVariable UUID id) {
        return ResponseEntity.ok(propertyService.approveListing(id));
    }

    @PutMapping("/properties/{id}/reject")
    public ResponseEntity<Property> rejectListing(@PathVariable UUID id, @RequestBody String reason) {
        return ResponseEntity.ok(propertyService.rejectListing(id, reason));
    }
}
