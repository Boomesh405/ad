package com.estatehub.controller;

import com.estatehub.config.JwtUtil;
import com.estatehub.dto.DocumentUploadRequest;
import com.estatehub.dto.PropertySearchCriteria;
import com.estatehub.entity.Property;
import com.estatehub.entity.PropertyDocument;
import com.estatehub.service.PropertyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    // FR1: Property Listing - Owner/Agent. Creator identity comes from the signed JWT,
    // never from a client-supplied header (SRS 5.3).
    @PostMapping
    @PreAuthorize("hasAnyRole('BUILDER_OWNER', 'AGENT')")
    public ResponseEntity<Property> create(@Valid @RequestBody Property property,
                                            @AuthenticationPrincipal JwtUtil.CurrentUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(propertyService.createListing(property, currentUser.userId()));
    }

    // FR2: Advanced Property Search - Public
    @GetMapping("/search")
    public ResponseEntity<Page<Property>> search(PropertySearchCriteria criteria) {
        return ResponseEntity.ok(propertyService.search(criteria));
    }

    // Property detail page - Public
    @GetMapping("/{id}")
    public ResponseEntity<Property> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(propertyService.getById(id));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<Void> recordView(@PathVariable UUID id) {
        propertyService.recordView(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('BUILDER_OWNER', 'AGENT', 'SUPER_ADMIN')")
    public ResponseEntity<Property> activate(@PathVariable UUID id,
                                              @AuthenticationPrincipal JwtUtil.CurrentUser currentUser) {
        return ResponseEntity.ok(propertyService.activateListing(id, currentUser.userId(), currentUser.isSuperAdmin()));
    }

    // Owner/Agent: upload property document (title deed, tax receipt, etc.)
    @PostMapping("/{id}/documents")
    @PreAuthorize("hasAnyRole('BUILDER_OWNER', 'AGENT')")
    public ResponseEntity<PropertyDocument> uploadDocument(
            @PathVariable UUID id,
            @Valid @RequestBody DocumentUploadRequest request,
            @AuthenticationPrincipal JwtUtil.CurrentUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(propertyService.uploadDocument(id, currentUser.userId(), request));
    }

    // Public: list documents for a property
    @GetMapping("/{id}/documents")
    public ResponseEntity<List<PropertyDocument>> getDocuments(@PathVariable UUID id) {
        return ResponseEntity.ok(propertyService.getDocuments(id));
    }
}
