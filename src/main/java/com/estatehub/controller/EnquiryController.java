package com.estatehub.controller;

import com.estatehub.config.JwtUtil;
import com.estatehub.entity.CrmNote;
import com.estatehub.entity.Enquiry;
import com.estatehub.entity.enums.LeadStage;
import com.estatehub.exception.ResourceNotFoundException;
import com.estatehub.repository.CrmNoteRepository;
import com.estatehub.repository.EnquiryRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

// FR3: Lead and Enquiry Management
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class EnquiryController {

    private final EnquiryRepository enquiryRepository;
    private final CrmNoteRepository crmNoteRepository;

    @PostMapping("/enquiries")
    public ResponseEntity<Enquiry> submit(@Valid @RequestBody Enquiry enquiry) {
        // NOTE: buyer mobile OTP verification (Twilio) should occur before this endpoint is
        // called from the frontend; otpVerified flag gates lead creation from spam (SRS FR3, FR12).
        return ResponseEntity.status(HttpStatus.CREATED).body(enquiryRepository.save(enquiry));
    }

    @GetMapping("/agents/{agentId}/leads")
    @PreAuthorize("hasAnyRole('AGENT', 'SUPER_ADMIN')")
    public ResponseEntity<List<Enquiry>> leadQueue(@PathVariable UUID agentId,
                                                    @AuthenticationPrincipal JwtUtil.CurrentUser currentUser) {
        // Agents may only view their own lead queue (SRS 5.3)
        if (!currentUser.isSuperAdmin() && !currentUser.userId().equals(agentId)) {
            throw new AccessDeniedException("Agents can only view their own leads");
        }
        return ResponseEntity.ok(enquiryRepository.findByAgentId(agentId));
    }

    @PatchMapping("/enquiries/{id}/stage")
    @PreAuthorize("hasAnyRole('AGENT', 'SUPER_ADMIN')")
    public ResponseEntity<Enquiry> updateStage(@PathVariable UUID id, @RequestParam LeadStage stage,
                                                @RequestParam(required = false) String lostReason,
                                                @AuthenticationPrincipal JwtUtil.CurrentUser currentUser) {
        Enquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found"));
        // Only the assigned agent may update the lead; admins may override
        if (!currentUser.isSuperAdmin() && !currentUser.userId().equals(enquiry.getAgentId())) {
            throw new AccessDeniedException("You can only update your own leads");
        }
        enquiry.setStage(stage);
        if (stage == LeadStage.LOST) {
            enquiry.setLostReason(lostReason);
        }
        return ResponseEntity.ok(enquiryRepository.save(enquiry));
    }

    @PostMapping("/enquiries/{id}/notes")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<CrmNote> addNote(@PathVariable UUID id, @Valid @RequestBody CrmNote note,
                                            @AuthenticationPrincipal JwtUtil.CurrentUser currentUser) {
        Enquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found"));
        if (!currentUser.userId().equals(enquiry.getAgentId())) {
            throw new AccessDeniedException("You can only add notes to your own leads");
        }
        note.setEnquiryId(id);
        note.setAgentId(currentUser.userId()); // never trust agentId from the client (SRS 5.3)
        return ResponseEntity.status(HttpStatus.CREATED).body(crmNoteRepository.save(note));
    }

    @GetMapping("/enquiries/{id}/notes")
    @PreAuthorize("hasAnyRole('AGENT', 'SUPER_ADMIN')")
    public ResponseEntity<List<CrmNote>> getNotes(@PathVariable UUID id,
                                                   @AuthenticationPrincipal JwtUtil.CurrentUser currentUser) {
        Enquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found"));
        if (!currentUser.isSuperAdmin() && !currentUser.userId().equals(enquiry.getAgentId())) {
            throw new AccessDeniedException("You can only view notes for your own leads");
        }
        return ResponseEntity.ok(crmNoteRepository.findByEnquiryIdOrderByCreatedAtDesc(id));
    }
}
