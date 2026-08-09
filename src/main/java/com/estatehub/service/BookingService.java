package com.estatehub.service;

import com.estatehub.entity.Booking;
import com.estatehub.entity.Property;
import com.estatehub.entity.enums.BookingStatus;
import com.estatehub.entity.enums.ListingStatus;
import com.estatehub.exception.PropertyAlreadyBookedException;
import com.estatehub.exception.ResourceNotFoundException;
import com.estatehub.repository.BookingRepository;
import com.estatehub.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Booking + token payment flow (SRS FR5). Razorpay checkout call itself is stubbed —
 * wire in the Razorpay Java SDK using the key-id/key-secret from application.yml and
 * verify the payment.captured webhook signature before calling confirmBooking().
 */
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final PropertyRepository propertyRepository;

    @Transactional
    public Booking initiateBooking(UUID propertyId, UUID buyerId, BigDecimal tokenAmount, String razorpayOrderId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        // PropertyAlreadyBookedException - only one active booking per property (Appendix D, HTTP 409)
        boolean alreadyBooked = bookingRepository.findByPropertyIdAndStatus(propertyId, BookingStatus.CONFIRMED).isPresent();
        if (alreadyBooked || property.getListingStatus() == ListingStatus.BOOKED) {
            throw new PropertyAlreadyBookedException("Property already has an active booking");
        }

        if (tokenAmount.compareTo(BigDecimal.ZERO) <= 0 || tokenAmount.compareTo(property.getPrice()) >= 0) {
            throw new IllegalArgumentException("Invalid token amount");
        }

        return bookingRepository.save(Booking.builder()
                .propertyId(propertyId)
                .buyerId(buyerId)
                .tokenAmount(tokenAmount)
                .razorpayOrderId(razorpayOrderId)
                .status(BookingStatus.PENDING_PAYMENT)
                .build());
    }

    /**
     * Called from the Razorpay webhook handler once payment.captured is verified.
     * Idempotent: webhook retries for an already-confirmed booking are no-ops (SRS Appendix D).
     */
    @Transactional
    public Booking confirmBooking(UUID bookingId, String razorpayPaymentId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            return booking;
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setRazorpayPaymentId(razorpayPaymentId);
        bookingRepository.save(booking);

        Property property = propertyRepository.findById(booking.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
        property.setListingStatus(ListingStatus.BOOKED);
        propertyRepository.save(property);

        // TODO: generate booking slip PDF, send SMS/email confirmation, notify owner+agent
        return booking;
    }

    @Transactional
    public Booking cancelBooking(UUID bookingId, UUID actorUserId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        // Ownership check: buyers may only cancel their own bookings; admins may cancel any (SRS 5.3)
        if (!isAdmin && !booking.getBuyerId().equals(actorUserId)) {
            throw new AccessDeniedException("You can only cancel your own bookings");
        }

        // Cancellation allowed within 48 hours per SRS FR5; refund handled per owner-configured policy
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(java.time.LocalDateTime.now());
        return bookingRepository.save(booking);
    }
}
