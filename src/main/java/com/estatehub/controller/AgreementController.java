package com.estatehub.controller;

import com.estatehub.config.JwtUtil;
import com.estatehub.entity.Agreement;
import com.estatehub.service.AgreementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

// FR6: Agreement Management
@RestController
@RequestMapping("/api/v1/agreements")
@RequiredArgsConstructor
public class AgreementController {

    private final AgreementService agreementService;

    @PostMapping
    @PreAuthorize("hasAnyRole('BUILDER_OWNER', 'AGENT')")
    public ResponseEntity<Agreement> createDraft(@Valid @RequestBody Agreement agreement,
                                                  @AuthenticationPrincipal JwtUtil.CurrentUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(agreementService.createDraft(agreement, currentUser.userId(), currentUser.isSuperAdmin()));
    }

    // Owners/agents may only send agreements for properties they own or manage (checked in the service)
    @PostMapping("/{id}/send")
    @PreAuthorize("hasAnyRole('BUILDER_OWNER', 'AGENT')")
    public ResponseEntity<Agreement> sendForSigning(@PathVariable UUID id, @RequestParam String digioDocumentId,
                                                     @AuthenticationPrincipal JwtUtil.CurrentUser currentUser) {
        return ResponseEntity.ok(agreementService.sendForSigning(
                id, digioDocumentId, currentUser.userId(), currentUser.isSuperAdmin()));
    }

    // Agreements contain party and consideration details; not readable by arbitrary tenants/buyers.
    // (Fine-grained party checks are not possible while `parties` is unstructured JSON - SRS FR6)
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('BUILDER_OWNER', 'AGENT', 'SUPER_ADMIN')")
    public ResponseEntity<Agreement> get(@PathVariable UUID id) {
        return ResponseEntity.ok(agreementService.getById(id));
    }
}
