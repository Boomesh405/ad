package com.estatehub.controller.webhook.digio;

import com.estatehub.entity.Agreement;
import com.estatehub.exception.AgreementAlreadyExecutedException;
import com.estatehub.repository.AgreementRepository;
import com.estatehub.service.AgreementService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import java.util.Locale;

/**
 * Digio eSign webhook (SRS Appendix E.2).
 *
 * <p>Digio fires the webhook once every signer has acted on the agreement. Signature scheme
 * (per Digio docs): the {@code X-Digio-Checksum} header holds
 * {@code hex(HMAC-SHA256(webhookSecret, rawPayload))}. The raw payload is hashed as received.</p>
 *
 * <p>On a signed/completed event the matching agreement (by {@code digio_document_id}) is
 * marked EXECUTED. Downloading the signed PDF from Digio is a follow-up - the S3 key stays
 * null until then.</p>
 */
@RestController
@RequestMapping("/api/v1/digio/webhook")
@RequiredArgsConstructor
public class DigioWebhookController {

    private static final Logger log = LoggerFactory.getLogger(DigioWebhookController.class);

    private final AgreementRepository agreementRepository;
    private final AgreementService agreementService;
    private final ObjectMapper objectMapper;

    @Value("${digio.webhook-secret}")
    private String webhookSecret;

    @PostMapping
    public ResponseEntity<?> handleWebhook(@RequestBody String rawBody,
                                           @RequestHeader(value = "X-Digio-Checksum", required = false) String checksum) {
        if (checksum == null || !verifyChecksum(rawBody, checksum)) {
            log.warn("Digio webhook rejected: invalid checksum");
            return ResponseEntity.status(401).build();
        }

        JsonNode payload;
        try {
            payload = objectMapper.readTree(rawBody);
        } catch (Exception e) {
            log.warn("Digio webhook rejected: unparseable body");
            return ResponseEntity.badRequest().build();
        }

        // Accept the field shapes used by Digio and aggregators (e.g. Knit): status may live
        // at "documentStatus" or "status", the event at "eventType" or "event".
        String documentStatus = payload.path("documentStatus").asText(payload.path("status").asText(""));
        String eventType = payload.path("eventType").asText(payload.path("event").asText(""));

        if (!documentStatus.isBlank() && !isCompletedStatus(documentStatus)) {
            log.info("Digio webhook: ignoring document status '{}'", documentStatus);
            return ResponseEntity.ok().build();
        }
        if (documentStatus.isBlank() && !isSignedEvent(eventType)) {
            log.info("Digio webhook: ignoring event '{}'", eventType);
            return ResponseEntity.ok().build();
        }

        String digioDocumentId = extractDocumentId(payload);
        if (digioDocumentId == null) {
            log.warn("Digio webhook: no document id in payload");
            return ResponseEntity.badRequest().build();
        }

        Agreement agreement = agreementRepository.findByDigioDocumentId(digioDocumentId).orElse(null);
        if (agreement == null) {
            log.warn("Digio webhook: no agreement for document {}", digioDocumentId);
            return ResponseEntity.status(404).build();
        }

        try {
            agreementService.markExecuted(agreement.getAgreementId(), null);
            log.info("Digio webhook: agreement {} executed (document {})", agreement.getAgreementId(), digioDocumentId);
        } catch (AgreementAlreadyExecutedException e) {
            // Idempotent on webhook retries - already executed is a success
            log.info("Digio webhook: agreement {} already executed (retry)", agreement.getAgreementId());
        }
        return ResponseEntity.ok().build();
    }

    private boolean isCompletedStatus(String status) {
        return "COMPLETED".equalsIgnoreCase(status) || "SIGNED".equalsIgnoreCase(status);
    }

    private boolean isSignedEvent(String eventType) {
        String type = eventType.toLowerCase(Locale.ROOT);
        return "doc.signed".equals(type) || "esign.document.webhook".equals(type) || type.contains("signed");
    }

    private String extractDocumentId(JsonNode payload) {
        for (String field : List.of("documentSignId", "document_id", "documentId", "id")) {
            JsonNode atRoot = payload.path(field);
            if (atRoot.isTextual() && !atRoot.asText().isBlank()) {
                return atRoot.asText();
            }
            JsonNode inEventData = payload.path("eventData").path(field);
            if (inEventData.isTextual() && !inEventData.asText().isBlank()) {
                return inEventData.asText();
            }
        }
        return null;
    }

    private boolean verifyChecksum(String body, String expected) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.error("digio.webhook-secret is not configured - refusing to verify");
            return false;
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(body.getBytes(StandardCharsets.UTF_8));
            byte[] actual = toHex(digest).getBytes(StandardCharsets.UTF_8);
            return MessageDigest.isEqual(actual, expected.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.error("Digio webhook checksum check failed", e);
            return false;
        }
    }

    private static String toHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(Character.forDigit((b >> 4) & 0xF, 16));
            sb.append(Character.forDigit(b & 0xF, 16));
        }
        return sb.toString();
    }
}
