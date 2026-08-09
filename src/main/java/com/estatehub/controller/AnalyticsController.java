package com.estatehub.controller;

import com.estatehub.repository.BookingRepository;
import com.estatehub.repository.EnquiryRepository;
import com.estatehub.repository.PropertyRepository;
import com.estatehub.entity.enums.ListingStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

// FR11: Analytics and Reporting
@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('BUILDER_OWNER', 'SUPER_ADMIN')")
public class AnalyticsController {

    private final PropertyRepository propertyRepository;
    private final EnquiryRepository enquiryRepository;
    private final BookingRepository bookingRepository;

    @GetMapping("/inventory")
    public ResponseEntity<Map<String, Long>> inventory() {
        Map<String, Long> counts = new HashMap<>();
        for (ListingStatus status : ListingStatus.values()) {
            counts.put(status.name(), propertyRepository.findAll().stream()
                    .filter(p -> p.getListingStatus() == status).count());
        }
        return ResponseEntity.ok(counts);
        // NOTE: replace with a proper @Query COUNT/GROUP BY for production scale.
    }

    // Lead funnel, revenue, agent performance, price trend, and RERA compliance report
    // endpoints follow the same repository + aggregation pattern; add @Query projections
    // as the reporting requirements are finalised (SRS FR11, Appendix H.3).
}
