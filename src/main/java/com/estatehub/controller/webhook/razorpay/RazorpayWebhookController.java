package com.estatehub.controller.webhook.razorpay;

import com.estatehub.entity.Booking;
import com.estatehub.repository.BookingRepository;
import com.estatehub.service.BookingService;
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
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * Razorpay payment webhook (SRS Appendix E.1).
 *
 * <p>Signature scheme (per Razorpay docs): the {@code X-Razorpay-Signature} header holds
 * {@code base64(HMAC-SHA256(webhookSecret, rawRequestBody))}. The raw body is hashed as
 * received - never a re-serialized JSON - so {@code @RequestBody String} is used here.</p>
 *
 * <p>On {@code payment.captured} the matching booking (by {@code razorpay_order_id}) is
 * confirmed; the payment amount (paise) must equal the token amount (rupees * 100).</p>
 */
@RestController
@RequestMapping("/api/v1/razorpay/webhook")
@RequiredArgsConstructor
public class RazorpayWebhookController {

    private static final Logger log = LoggerFactory.getLogger(RazorpayWebhookController.class);
    private static final String PAYMENT_CAPTURED = "payment.captured";

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;
    private final ObjectMapper objectMapper;

    @Value("${razorpay.webhook-secret}")
    private String webhookSecret;

    @PostMapping
    public ResponseEntity<?> handleWebhook(@RequestBody String rawBody,
                                           @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        if (signature == null || !verifySignature(rawBody, signature)) {
            log.warn("Razorpay webhook rejected: invalid signature");
            return ResponseEntity.status(401).build();
        }

        JsonNode payload;
        try {
            payload = objectMapper.readTree(rawBody);
        } catch (Exception e) {
            log.warn("Razorpay webhook rejected: unparseable body");
            return ResponseEntity.badRequest().build();
        }

        if (!PAYMENT_CAPTURED.equals(payload.path("event").asText())) {
            log.info("Razorpay webhook: ignoring event '{}'", payload.path("event").asText());
            return ResponseEntity.ok().build();
        }

        JsonNode payment = payload.path("payload").path("payment").path("entity");
        String paymentId = payment.path("id").asText(null);
        String orderId = payment.path("order_id").asText(null);
        if (paymentId == null || orderId == null) {
            log.warn("Razorpay webhook: payment entity missing id/order_id");
            return ResponseEntity.badRequest().build();
        }

        Booking booking = bookingRepository.findByRazorpayOrderId(orderId).orElse(null);
        if (booking == null) {
            log.warn("Razorpay webhook: no booking for order {}", orderId);
            return ResponseEntity.status(404).build();
        }

        // Razorpay amounts are in paise; the booking token amount is in rupees
        if (payment.has("amount")) {
            BigDecimal expectedPaise = booking.getTokenAmount().multiply(BigDecimal.valueOf(100));
            BigDecimal actualPaise = BigDecimal.valueOf(payment.get("amount").asLong());
            if (actualPaise.compareTo(expectedPaise) != 0) {
                log.warn("Razorpay webhook: amount mismatch for booking {} (got {}, expected {})",
                        booking.getBookingId(), actualPaise, expectedPaise);
                return ResponseEntity.badRequest().build();
            }
        }

        bookingService.confirmBooking(booking.getBookingId(), paymentId);
        log.info("Razorpay webhook: booking {} confirmed (payment {})", booking.getBookingId(), paymentId);
        return ResponseEntity.ok().build();
    }

    private boolean verifySignature(String body, String expected) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.error("razorpay.webhook-secret is not configured - refusing to verify");
            return false;
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(body.getBytes(StandardCharsets.UTF_8));
            byte[] actual = Base64.getEncoder().encodeToString(digest).getBytes(StandardCharsets.UTF_8);
            return MessageDigest.isEqual(actual, expected.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.error("Razorpay webhook signature check failed", e);
            return false;
        }
    }
}
