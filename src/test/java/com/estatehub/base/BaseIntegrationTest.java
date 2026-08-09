package com.estatehub.base;

import com.estatehub.config.JwtUtil;
import com.estatehub.dto.AuthResponse;
import com.estatehub.dto.RegisterRequest;
import com.estatehub.entity.Property;
import com.estatehub.entity.User;
import com.estatehub.entity.enums.PossessionStatus;
import com.estatehub.entity.enums.PropertyType;
import com.estatehub.entity.enums.Role;
import com.estatehub.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Shared setup for integration tests: full Spring context booted with the "test" profile
 * (H2, Flyway off, Hibernate create-drop) and MockMvc going through the real security
 * filter chain (JWT + @PreAuthorize + ownership checks all active).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class BaseIntegrationTest {

    private static final AtomicInteger SEQ = new AtomicInteger(10_000);

    // Must match razorpay.webhook-secret / digio.webhook-secret in application-test.yml
    protected static final String RAZORPAY_WEBHOOK_SECRET = "razorpay-test-webhook-secret";
    protected static final String DIGIO_WEBHOOK_SECRET = "digio-test-webhook-secret";

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected JwtUtil jwtUtil;

    /** Unique, DB-valid (<= 15 chars) mobile per test - no @Transactional rollback needed. */
    protected String uniqueMobile() {
        return "9" + String.format("%09d", SEQ.getAndIncrement());
    }

    protected RegisterRequest registerRequest(String mobile, Role role) {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setMobile(mobile);
        request.setEmail(mobile + "@test.com");
        request.setPassword("Test@1234");
        request.setRole(role);
        return request;
    }

    /** Registers through the real /api/v1/auth/register endpoint and returns mobile + tokens. */
    protected Registered register(Role role) throws Exception {
        String mobile = uniqueMobile();
        RegisterRequest request = registerRequest(mobile, role);
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
        AuthResponse auth = objectMapper.readValue(result.getResponse().getContentAsString(), AuthResponse.class);
        return new Registered(mobile, auth);
    }

    protected MockHttpServletRequestBuilder withAuth(MockHttpServletRequestBuilder builder, AuthResponse auth) {
        return builder.header("Authorization", "Bearer " + auth.getAccessToken());
    }

    /**
     * SUPER_ADMIN cannot self-register (SRS 5.3), so mint its token directly from a DB user.
     */
    protected String adminToken() throws Exception {
        User admin = userRepository.save(User.builder()
                .name("Admin")
                .mobile(uniqueMobile())
                .email(uniqueMobile() + "@admin.test")
                .passwordHash("not-used")
                .role(Role.SUPER_ADMIN)
                .build());
        return jwtUtil.generateAccessToken(admin.getMobile(), admin.getRole().name(), admin.getUserId().toString());
    }

    protected Property newProperty(String ownerId, String city) {
        Property property = new Property();
        property.setOwnerId(UUID.fromString(ownerId));
        property.setTitle("2 BHK Apartment in " + city);
        property.setPropertyType(PropertyType.APARTMENT);
        property.setBhkConfig("2 BHK");
        property.setCarpetAreaSqft(1200.0);
        property.setPrice(new BigDecimal("5000000"));
        property.setPossessionStatus(PossessionStatus.READY_TO_MOVE);
        property.setCity(city);
        property.setAddress(city + " Main Road");
        property.setViewCount(0L);
        return property;
    }

    protected String createProperty(AuthResponse owner) throws Exception {
        return createProperty(owner, "Bengaluru");
    }

    protected String createProperty(AuthResponse owner, String city) throws Exception {
        MvcResult result = mockMvc.perform(withAuth(post("/api/v1/properties"), owner)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newProperty(owner.getUserId(), city))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("propertyId").asText();
    }

    protected String initiateBooking(String propertyId, AuthResponse buyer, String tokenAmount) throws Exception {
        return initiateBooking(propertyId, buyer, tokenAmount, null);
    }

    protected String initiateBooking(String propertyId, AuthResponse buyer, String tokenAmount,
                                     String razorpayOrderId) throws Exception {
        MockHttpServletRequestBuilder request = withAuth(post("/api/v1/bookings"), buyer)
                .param("propertyId", propertyId)
                .param("tokenAmount", tokenAmount);
        if (razorpayOrderId != null) {
            request.param("razorpayOrderId", razorpayOrderId);
        }
        MvcResult result = mockMvc.perform(request)
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("bookingId").asText();
    }

    /** Razorpay payment.captured payload, amount in paise matching tokenAmountRupees. */
    protected String paymentCapturedPayload(String orderId, String paymentId, String tokenAmountRupees) {
        long paise = new BigDecimal(tokenAmountRupees).multiply(BigDecimal.valueOf(100)).longValueExact();
        return "{\"event\":\"payment.captured\",\"payload\":{\"payment\":{\"entity\":{"
                + "\"id\":\"" + paymentId + "\","
                + "\"order_id\":\"" + orderId + "\","
                + "\"amount\":" + paise
                + "}}}}";
    }

    /** base64(HMAC-SHA256(webhookSecret, rawBody)) - the X-Razorpay-Signature scheme. */
    protected String razorpaySignature(String rawBody) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(RAZORPAY_WEBHOOK_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return Base64.getEncoder().encodeToString(mac.doFinal(rawBody.getBytes(StandardCharsets.UTF_8)));
    }

    /** hex(HMAC-SHA256(webhookSecret, rawBody)) - the X-Digio-Checksum scheme. */
    protected String digioChecksum(String rawBody) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(DIGIO_WEBHOOK_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] digest = mac.doFinal(rawBody.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    protected record Registered(String mobile, AuthResponse auth) {
    }
}
