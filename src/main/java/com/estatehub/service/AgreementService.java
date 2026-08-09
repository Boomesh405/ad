package com.estatehub.service;

import com.estatehub.entity.Agreement;
import com.estatehub.entity.enums.AgreementStatus;
import com.estatehub.exception.AgreementAlreadyExecutedException;
import com.estatehub.exception.ResourceNotFoundException;
import com.estatehub.repository.AgreementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Sale/Rent agreement lifecycle (SRS FR6). E-signing itself is delegated to Digio —
 * sendForSigning() should call the Digio API with the templated PDF and store the
 * returned digioDocumentId; the Digio webhook handler should call markExecuted().
 */
@Service
@RequiredArgsConstructor
public class AgreementService {

    private final AgreementRepository agreementRepository;
    private final PropertyService propertyService;

    @Transactional
    public Agreement createDraft(Agreement agreement, UUID actorUserId, boolean isAdmin) {
        // Ownership check: owners/agents may only draft agreements for their own properties (SRS 5.3)
        if (!isAdmin && !propertyService.isOwnerOrAgent(agreement.getPropertyId(), actorUserId)) {
            throw new AccessDeniedException("You can only create agreements for properties you own or manage");
        }
        agreement.setStatus(AgreementStatus.DRAFT);
        return agreementRepository.save(agreement);
    }

    @Transactional
    public Agreement sendForSigning(UUID agreementId, String digioDocumentId, UUID actorUserId, boolean isAdmin) {
        Agreement agreement = getById(agreementId);

        // AgreementAlreadyExecutedException - duplicate execution of same agreement (Appendix D, HTTP 409)
        if (agreement.getStatus() == AgreementStatus.EXECUTED) {
            throw new AgreementAlreadyExecutedException("Agreement is already executed");
        }

        // Ownership check: only the property owner or its listing agent may send it for signing (SRS 5.3)
        if (!isAdmin && !propertyService.isOwnerOrAgent(agreement.getPropertyId(), actorUserId)) {
            throw new AccessDeniedException("You can only send agreements for properties you own or manage");
        }

        agreement.setStatus(AgreementStatus.SENT_FOR_SIGNING);
        agreement.setDigioDocumentId(digioDocumentId);
        return agreementRepository.save(agreement);
    }

    @Transactional
    public Agreement markPartiallySigned(UUID agreementId) {
        Agreement agreement = getById(agreementId);
        agreement.setStatus(AgreementStatus.PARTIALLY_SIGNED);
        return agreementRepository.save(agreement);
    }

    @Transactional
    public Agreement markExecuted(UUID agreementId, String signedDocS3Key) {
        Agreement agreement = getById(agreementId);
        if (agreement.getStatus() == AgreementStatus.EXECUTED) {
            throw new AgreementAlreadyExecutedException("Agreement is already executed");
        }
        agreement.setStatus(AgreementStatus.EXECUTED);
        agreement.setSignedDocumentS3Key(signedDocS3Key);
        return agreementRepository.save(agreement);
    }

    @Transactional(readOnly = true)
    public Agreement getById(UUID agreementId) {
        return agreementRepository.findById(agreementId)
                .orElseThrow(() -> new ResourceNotFoundException("Agreement not found"));
    }
}
