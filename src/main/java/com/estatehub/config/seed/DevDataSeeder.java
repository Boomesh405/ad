package com.estatehub.config.seed;

import com.estatehub.entity.Property;
import com.estatehub.entity.User;
import com.estatehub.entity.enums.ListingStatus;
import com.estatehub.entity.enums.PossessionStatus;
import com.estatehub.entity.enums.PropertyType;
import com.estatehub.entity.enums.Role;
import com.estatehub.repository.PropertyRepository;
import com.estatehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Demo data for local development / the frontend preview. Active only with the
 * "devdemo" profile (never in tests or production): creates one admin, one
 * builder-owner, one buyer, two live listings, and one pending listing so every
 * role-based flow of the UI can be exercised out of the box.
 *
 * Credentials (dev only): admin / owner / buyer all use password "Demo@1234".
 */
@Slf4j
@Component
@Profile("devdemo")
@RequiredArgsConstructor
public class DevDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByMobile("9000000001").isPresent()) {
            log.info("DevDataSeeder: data already present, skipping");
            return;
        }

        User admin = user("9000000001", "Demo Admin", Role.SUPER_ADMIN);
        User owner = user("9000000002", "Demo Builder", Role.BUILDER_OWNER);
        User buyer = user("9000000003", "Demo Buyer", Role.BUYER_TENANT);
        userRepository.saveAll(List.of(admin, owner, buyer));

        propertyRepository.saveAll(List.of(
                property(owner, "Skyline 3BHK Apartment", PropertyType.APARTMENT, "3 BHK",
                        "Koramangala", "Bengaluru", "Karnataka", "560034", 1200.0,
                        new BigDecimal("12500000"), ListingStatus.ACTIVE),
                property(owner, "Green Valley Villa", PropertyType.VILLA, "4 BHK",
                        "Gachibowli", "Hyderabad", "Telangana", "500032", 2400.0,
                        new BigDecimal("35000000"), ListingStatus.ACTIVE),
                property(owner, "Sunrise 2BHK (Under Construction)", PropertyType.APARTMENT, "2 BHK",
                        "Hinjewadi", "Pune", "Maharashtra", "411057", 950.0,
                        new BigDecimal("6500000"), ListingStatus.PENDING_APPROVAL)
        ));

        log.info("DevDataSeeder: seeded admin 9000000001, owner 9000000002, buyer 9000000003 (password Demo@1234) + 3 listings");
    }

    private User user(String mobile, String name, Role role) {
        return User.builder()
                .name(name)
                .mobile(mobile)
                .email(mobile + "@demo.estatehub.in")
                .passwordHash(passwordEncoder.encode("Demo@1234"))
                .role(role)
                .kycVerified(true)
                .build();
    }

    private Property property(User owner, String title, PropertyType type, String bhk,
                              String locality, String city, String state, String pincode,
                              double areaSqft, BigDecimal price, ListingStatus status) {
        return Property.builder()
                .ownerId(owner.getUserId())
                .title(title)
                .propertyType(type)
                .bhkConfig(bhk)
                .carpetAreaSqft(areaSqft)
                .price(price)
                .address(locality + " Main Road")
                .city(city)
                .state(state)
                .pincode(pincode)
                .landmark(locality)
                .possessionStatus(PossessionStatus.READY_TO_MOVE)
                .listingStatus(status)
                .amenities(List.of("Car parking", "Gym", "Lift", "24x7 water"))
                .viewCount(0L)
                .build();
    }
}
