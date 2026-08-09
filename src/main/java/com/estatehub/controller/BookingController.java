package com.estatehub.controller;

import com.estatehub.config.JwtUtil;
import com.estatehub.entity.Booking;
import com.estatehub.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

// FR5: Booking and Token Payment
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // The buyer is taken from the signed JWT - never from a client-supplied param (SRS 5.3).
    // razorpayOrderId is the order created at checkout; the Razorpay webhook confirms the booking
    // by it, so a booking without one can never be confirmed (SRS Appendix E.1).
    @PostMapping
    @PreAuthorize("hasRole('BUYER_TENANT')")
    public ResponseEntity<Booking> initiate(@RequestParam UUID propertyId,
                                             @RequestParam BigDecimal tokenAmount,
                                             @RequestParam(required = false) String razorpayOrderId,
                                             @AuthenticationPrincipal JwtUtil.CurrentUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.initiateBooking(propertyId, currentUser.userId(), tokenAmount, razorpayOrderId));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('BUYER_TENANT', 'SUPER_ADMIN')")
    public ResponseEntity<Booking> cancel(@PathVariable UUID id,
                                           @AuthenticationPrincipal JwtUtil.CurrentUser currentUser) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, currentUser.userId(), currentUser.isSuperAdmin()));
    }
}
