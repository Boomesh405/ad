package com.estatehub.controller;

import com.estatehub.config.JwtUtil;
import com.estatehub.entity.DocumentShare;
import com.estatehub.entity.PropertyDocument;
import com.estatehub.entity.User;
import com.estatehub.exception.DocumentAccessDeniedException;
import com.estatehub.exception.ResourceNotFoundException;
import com.estatehub.repository.DocumentShareRepository;
import com.estatehub.repository.PropertyDocumentRepository;
import com.estatehub.repository.UserRepository;
import com.estatehub.service.PropertyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

// FR9: Document Vault
@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final PropertyDocumentRepository documentRepository;
    private final DocumentShareRepository documentShareRepository;
    private final PropertyService propertyService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('BUILDER_OWNER')")
    public ResponseEntity<PropertyDocument> upload(@Valid @RequestBody PropertyDocument doc,
                                                    @AuthenticationPrincipal JwtUtil.CurrentUser currentUser) {
        // Builders may only upload documents for their own properties (SRS 5.3). Actual file bytes
        // go to a private S3 bucket via a pre-signed PUT URL generated server-side; only the
        // resulting s3Key is persisted here (SRS FR9, 2.5).
        if (!propertyService.isOwnerOrAgent(doc.getPropertyId(), currentUser.userId())) {
            throw new DocumentAccessDeniedException("You can only upload documents for your own properties");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(documentRepository.save(doc));
    }

    // Sensitive title-deed documents: only the property owner, its listing agent, or an admin may list them
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<PropertyDocument>> byProperty(@PathVariable UUID propertyId,
                                                              @AuthenticationPrincipal JwtUtil.CurrentUser currentUser) {
        if (!currentUser.isSuperAdmin() && !propertyService.isOwnerOrAgent(propertyId, currentUser.userId())) {
            throw new DocumentAccessDeniedException("You do not have access to this property's documents");
        }
        return ResponseEntity.ok(documentRepository.findByPropertyId(propertyId));
    }

    @PostMapping("/{id}/share")
    @PreAuthorize("hasRole('BUILDER_OWNER')")
    public ResponseEntity<DocumentShare> share(@PathVariable UUID id,
                                                @RequestParam String email,
                                                @AuthenticationPrincipal JwtUtil.CurrentUser currentUser) {
        // Sharer identity comes from the signed JWT - never from a client-supplied param (SRS 5.3),
        // and only the owner of the document's property may share it.
        PropertyDocument doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        if (!propertyService.isOwnerOrAgent(doc.getPropertyId(), currentUser.userId())) {
            throw new DocumentAccessDeniedException("You can only share documents for your own properties");
        }

        DocumentShare share = DocumentShare.builder()
                .docId(id)
                .sharedWithEmail(email)
                .sharedByUserId(currentUser.userId())
                .expiresAt(LocalDateTime.now().plusDays(7)) // 7-day signed URL expiry, per Appendix D
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(documentShareRepository.save(share));
    }

    @GetMapping("/{id}/access")
    public ResponseEntity<String> accessSignedUrl(@PathVariable UUID id, @RequestParam String requesterEmail,
                                                   @AuthenticationPrincipal JwtUtil.CurrentUser currentUser) {
        // The requester must be authenticated and their registered email must match the email the
        // document was shared with (admins are exempt from the email match, but still need a valid share).
        // Prevents impersonating an arbitrary email address (SRS FR9, 5.3).
        if (!currentUser.isSuperAdmin()) {
            User user = userRepository.findById(currentUser.userId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            if (user.getEmail() == null || !user.getEmail().equalsIgnoreCase(requesterEmail)) {
                throw new DocumentAccessDeniedException("You do not have access to this document");
            }
        }

        // DocumentAccessDeniedException - document access without owner sharing permission (Appendix D, HTTP 403)
        List<DocumentShare> shares = documentShareRepository.findByDocIdAndSharedWithEmail(id, requesterEmail);
        boolean hasValidShare = shares.stream().anyMatch(s -> s.getExpiresAt().isAfter(LocalDateTime.now()));
        if (!hasValidShare) {
            throw new DocumentAccessDeniedException("You do not have access to this document");
        }
        // TODO: generate and return an actual S3 pre-signed GET URL; log the access (SRS FR9 audit log)
        return ResponseEntity.ok("signed-url-placeholder-for-doc-" + id);
    }
}
