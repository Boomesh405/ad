package com.estatehub.booking;

import com.estatehub.base.BaseIntegrationTest;
import com.estatehub.dto.AuthResponse;
import com.estatehub.entity.enums.Role;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class BookingIntegrationTest extends BaseIntegrationTest {

    @Test
    void buyerInitiatesBookingWithOwnIdentity() throws Exception {
        AuthResponse owner = register(Role.BUILDER_OWNER).auth();
        String propertyId = createProperty(owner);
        AuthResponse buyer = register(Role.BUYER_TENANT).auth();

        mockMvc.perform(withAuth(post("/api/v1/bookings"), buyer)
                        .param("propertyId", propertyId)
                        .param("tokenAmount", "50000"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING_PAYMENT"))
                // identity comes from the signed JWT, not a client-supplied param
                .andExpect(jsonPath("$.buyerId").value(buyer.getUserId()));
    }

    @Test
    void tokenAmountMustBeBelowPropertyPrice() throws Exception {
        AuthResponse owner = register(Role.BUILDER_OWNER).auth();
        String propertyId = createProperty(owner); // price is 5,000,000
        AuthResponse buyer = register(Role.BUYER_TENANT).auth();

        mockMvc.perform(withAuth(post("/api/v1/bookings"), buyer)
                        .param("propertyId", propertyId)
                        .param("tokenAmount", "5000000"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void webhookRejectsInvalidSignature() throws Exception {
        AuthResponse owner = register(Role.BUILDER_OWNER).auth();
        String propertyId = createProperty(owner);
        AuthResponse buyer = register(Role.BUYER_TENANT).auth();
        initiateBooking(propertyId, buyer, "50000", "order_test_1");

        String body = paymentCapturedPayload("order_test_1", "pay_test_1", "50000");
        mockMvc.perform(post("/api/v1/razorpay/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .header("X-Razorpay-Signature", "not-a-valid-signature"))
                .andExpect(status().isUnauthorized());

        // nothing changed - the listing is not BOOKED
        mockMvc.perform(get("/api/v1/properties/" + propertyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.listingStatus").value("PENDING_APPROVAL"));
    }

    @Test
    void webhookConfirmsBookingAndMarksPropertyBooked() throws Exception {
        AuthResponse owner = register(Role.BUILDER_OWNER).auth();
        String propertyId = createProperty(owner);
        AuthResponse buyer = register(Role.BUYER_TENANT).auth();
        initiateBooking(propertyId, buyer, "50000", "order_test_2");

        String body = paymentCapturedPayload("order_test_2", "pay_test_2", "50000");
        mockMvc.perform(post("/api/v1/razorpay/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .header("X-Razorpay-Signature", razorpaySignature(body)))
                .andExpect(status().isOk());

        // the public property detail endpoint now shows the listing as BOOKED
        mockMvc.perform(get("/api/v1/properties/" + propertyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.listingStatus").value("BOOKED"));
    }

    @Test
    void webhookDoesNotConfirmUnknownOrder() throws Exception {
        AuthResponse owner = register(Role.BUILDER_OWNER).auth();
        String propertyId = createProperty(owner);
        AuthResponse buyer = register(Role.BUYER_TENANT).auth();
        initiateBooking(propertyId, buyer, "50000", "order_test_3");

        String body = paymentCapturedPayload("order_unknown", "pay_test_3", "50000");
        mockMvc.perform(post("/api/v1/razorpay/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .header("X-Razorpay-Signature", razorpaySignature(body)))
                .andExpect(status().isNotFound());
    }

    @Test
    void confirmedBookingBlocksFurtherBookings() throws Exception {
        AuthResponse owner = register(Role.BUILDER_OWNER).auth();
        String propertyId = createProperty(owner);
        AuthResponse buyer = register(Role.BUYER_TENANT).auth();
        initiateBooking(propertyId, buyer, "50000", "order_test_4");

        String body = paymentCapturedPayload("order_test_4", "pay_test_4", "50000");
        mockMvc.perform(post("/api/v1/razorpay/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .header("X-Razorpay-Signature", razorpaySignature(body)))
                .andExpect(status().isOk());

        mockMvc.perform(withAuth(post("/api/v1/bookings"), buyer)
                        .param("propertyId", propertyId)
                        .param("tokenAmount", "50000"))
                .andExpect(status().isConflict());
    }

    @Test
    void buyerCanCancelOwnBooking() throws Exception {
        AuthResponse owner = register(Role.BUILDER_OWNER).auth();
        String propertyId = createProperty(owner);
        AuthResponse buyer = register(Role.BUYER_TENANT).auth();
        String bookingId = initiateBooking(propertyId, buyer, "50000");

        mockMvc.perform(withAuth(post("/api/v1/bookings/" + bookingId + "/cancel"), buyer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    void buyerCannotCancelSomeoneElsesBooking() throws Exception {
        AuthResponse owner = register(Role.BUILDER_OWNER).auth();
        String propertyId = createProperty(owner);
        AuthResponse buyer1 = register(Role.BUYER_TENANT).auth();
        String bookingId = initiateBooking(propertyId, buyer1, "50000");
        AuthResponse buyer2 = register(Role.BUYER_TENANT).auth();

        mockMvc.perform(withAuth(post("/api/v1/bookings/" + bookingId + "/cancel"), buyer2))
                .andExpect(status().isForbidden());
    }
}
