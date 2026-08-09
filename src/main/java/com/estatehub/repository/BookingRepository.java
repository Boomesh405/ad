package com.estatehub.repository;

import com.estatehub.entity.Booking;
import com.estatehub.entity.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByPropertyId(UUID propertyId);
    Optional<Booking> findByPropertyIdAndStatus(UUID propertyId, BookingStatus status);
    Optional<Booking> findByRazorpayOrderId(String razorpayOrderId);
    List<Booking> findByBuyerId(UUID buyerId);
    List<Booking> findByBuyerIdOrderByCreatedAtDesc(UUID buyerId);
}
