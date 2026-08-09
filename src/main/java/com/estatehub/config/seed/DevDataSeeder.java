package com.estatehub.config.seed;

import com.estatehub.entity.Booking;
import com.estatehub.entity.CrmNote;
import com.estatehub.entity.Enquiry;
import com.estatehub.entity.Property;
import com.estatehub.entity.User;
import com.estatehub.entity.enums.BookingStatus;
import com.estatehub.entity.enums.LeadStage;
import com.estatehub.entity.enums.ListingStatus;
import com.estatehub.entity.enums.PossessionStatus;
import com.estatehub.entity.enums.PropertyType;
import com.estatehub.entity.enums.Role;
import com.estatehub.repository.BookingRepository;
import com.estatehub.repository.CrmNoteRepository;
import com.estatehub.repository.EnquiryRepository;
import com.estatehub.repository.PropertyRepository;
import com.estatehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Demo data for local development / the frontend preview. Active only with the
 * "devdemo" profile (never in tests or production). Mirrors the data seeded for
 * all environments by the Flyway migration V2__seed_demo_data.sql so the preview
 * and a deployed database look the same. All accounts use password "Demo@1234".
 */
@Slf4j
@Component
@Profile("devdemo")
@RequiredArgsConstructor
public class DevDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final BookingRepository bookingRepository;
    private final EnquiryRepository enquiryRepository;
    private final CrmNoteRepository crmNoteRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByMobile("9000000001").isPresent()) {
            log.info("DevDataSeeder: data already present, skipping");
            return;
        }

        User admin = user("9000000001", "Demo Admin", Role.SUPER_ADMIN);
        User owner1 = user("9000000011", "Skyline Developers", Role.BUILDER_OWNER);
        User owner2 = user("9000000012", "GreenValley Estates", Role.BUILDER_OWNER);
        User owner3 = user("9000000013", "Imperial Homes", Role.BUILDER_OWNER);
        User agent1 = user("9000000021", "Rohan Kapoor", Role.AGENT);
        User agent2 = user("9000000022", "Meera Nair", Role.AGENT);
        User buyer1 = user("9000000031", "Amit Verma", Role.BUYER_TENANT);
        User buyer2 = user("9000000032", "Kavya Iyer", Role.BUYER_TENANT);
        User buyer3 = user("9000000033", "Vikram Singh", Role.BUYER_TENANT);
        userRepository.saveAll(List.of(admin, owner1, owner2, owner3, agent1, agent2, buyer1, buyer2, buyer3));

        Property skyline = property(owner1, agent1, "Skyline 3BHK Apartment", PropertyType.APARTMENT, "3 BHK",
                "Bengaluru", "Karnataka", "560034", 1200, 12500000L, PossessionStatus.READY_TO_MOVE, ListingStatus.ACTIVE, null,
                "Car parking", "Gym", "Lift", "24x7 water");
        Property villa = property(owner2, agent2, "Green Valley Villa", PropertyType.VILLA, "4 BHK",
                "Hyderabad", "Telangana", "500032", 2400, 35000000L, PossessionStatus.READY_TO_MOVE, ListingStatus.ACTIVE, null,
                "Private garden", "Swimming pool", "Home automation");
        Property sunrise = property(owner1, agent1, "Sunrise 2BHK", PropertyType.APARTMENT, "2 BHK",
                "Pune", "Maharashtra", "411057", 950, 6500000L, PossessionStatus.UNDER_CONSTRUCTION, ListingStatus.PENDING_APPROVAL, "P52100012345");
        Property palm = property(owner2, agent2, "Palm Grove 3BHK", PropertyType.APARTMENT, "3 BHK",
                "Mumbai", "Maharashtra", "400053", 1350, 28500000L, PossessionStatus.READY_TO_MOVE, ListingStatus.ACTIVE, null,
                "Sea-facing balcony", "Clubhouse", "Gym", "Lift");
        Property lotus = property(owner1, null, "Lotus Residency 2BHK", PropertyType.APARTMENT, "2 BHK",
                "Chennai", "Tamil Nadu", "600042", 1050, 9800000L, PossessionStatus.READY_TO_MOVE, ListingStatus.ACTIVE, null,
                "Children play area", "Lift");
        Property imperial = property(owner3, agent1, "Imperial Heights 3BHK", PropertyType.APARTMENT, "3 BHK",
                "Delhi", "Delhi", "110075", 1500, 32000000L, PossessionStatus.UNDER_CONSTRUCTION, ListingStatus.ACTIVE, "DL1234567890",
                "RERA registered", "Smart lock", "EV charging");
        Property cedar = property(owner3, null, "Cedar Court Independent House", PropertyType.INDEPENDENT_HOUSE, "2 BHK",
                "Jaipur", "Rajasthan", "302017", 1400, 14500000L, PossessionStatus.READY_TO_MOVE, ListingStatus.ACTIVE, null,
                "Garden", "Servant quarter");
        Property marina = property(owner2, agent2, "Marina Bay Office Tower", PropertyType.OFFICE_SPACE, null,
                "Mumbai", "Maharashtra", "400051", 2200, 55000000L, PossessionStatus.READY_TO_MOVE, ListingStatus.ACTIVE, null,
                "Lobby", "24x7 security", "Parking");
        Property cornerShop = property(owner1, null, "Corner Shop Retail", PropertyType.RETAIL, null,
                "Hyderabad", "Telangana", "500033", 600, 9000000L, PossessionStatus.READY_TO_MOVE, ListingStatus.ACTIVE, null);
        Property happy = property(owner3, agent1, "Happy Homes 1BHK", PropertyType.APARTMENT, "1 BHK",
                "Kolkata", "West Bengal", "700091", 650, 5500000L, PossessionStatus.READY_TO_MOVE, ListingStatus.ACTIVE, null,
                "Near metro", "Lift");
        Property metro = property(owner2, null, "Metro Logistics Warehouse", PropertyType.WAREHOUSE, null,
                "Pune", "Maharashtra", "410501", 5000, 42000000L, PossessionStatus.READY_TO_MOVE, ListingStatus.ACTIVE, null);
        Property plot = property(owner3, null, "Hillcrest Garden Plot", PropertyType.PLOT, null,
                "Bengaluru", "Karnataka", "560066", 1800, 22000000L, PossessionStatus.READY_TO_MOVE, ListingStatus.PENDING_APPROVAL, null);
        Property bungalow = property(owner1, agent1, "Old Bungalow Duplex", PropertyType.INDEPENDENT_HOUSE, "4 BHK",
                "Chennai", "Tamil Nadu", "600020", 2600, 48000000L, PossessionStatus.READY_TO_MOVE, ListingStatus.REJECTED, null);
        bungalow.setRejectionReason("Title deed mismatch - owner documents pending verification");
        Property booked = property(owner1, null, "Booked Skyline 2BHK", PropertyType.APARTMENT, "2 BHK",
                "Bengaluru", "Karnataka", "560095", 1100, 11500000L, PossessionStatus.READY_TO_MOVE, ListingStatus.BOOKED, null,
                "Car parking", "Lift", "Gym");

        propertyRepository.saveAll(List.of(skyline, villa, sunrise, palm, lotus, imperial, cedar,
                marina, cornerShop, happy, metro, plot, bungalow, booked));

        bookingRepository.saveAll(List.of(
                Booking.builder().propertyId(booked.getPropertyId()).buyerId(buyer1.getUserId())
                        .tokenAmount(new BigDecimal("115000")).status(BookingStatus.CONFIRMED)
                        .razorpayOrderId("order_demo_0001").razorpayPaymentId("pay_demo_0001").build(),
                Booking.builder().propertyId(skyline.getPropertyId()).buyerId(buyer2.getUserId())
                        .tokenAmount(new BigDecimal("125000")).status(BookingStatus.PENDING_PAYMENT)
                        .razorpayOrderId("order_demo_0002").build(),
                Booking.builder().propertyId(sunrise.getPropertyId()).buyerId(buyer3.getUserId())
                        .tokenAmount(new BigDecimal("65000")).status(BookingStatus.CANCELLED)
                        .razorpayOrderId("order_demo_0003").refundAmount(new BigDecimal("65000")).build()
        ));

        Enquiry e1 = enquiry(skyline.getPropertyId(), agent1, "Ramesh Kumar", "9811111111", LeadStage.SITE_VISIT_DONE, 80);
        Enquiry e2 = enquiry(lotus.getPropertyId(), agent2, "Priya Sharma", "9822222222", LeadStage.NEGOTIATION, 65);
        Enquiry e3 = enquiry(villa.getPropertyId(), agent1, "Arjun Mehta", "9833333333", LeadStage.NEW, 20);
        Enquiry e4 = enquiry(imperial.getPropertyId(), agent2, "Sneha Reddy", "9844444444", LeadStage.CONTACTED, 40);
        enquiryRepository.saveAll(List.of(e1, e2, e3, e4));

        crmNoteRepository.saveAll(List.of(
                note(e1, agent1, "Buyer visited site, liked the 7th floor unit with park view", LocalDate.now().plusDays(10)),
                note(e2, agent2, "Negotiating price - offered a 2% discount, awaiting builder approval", LocalDate.now().plusDays(5)),
                note(e3, agent1, "Initial call done; buyer wants a virtual tour before site visit", LocalDate.now().plusDays(15))
        ));

        log.info("DevDataSeeder: seeded 9 users, 14 listings, 3 bookings, 4 enquiries (password Demo@1234)");
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

    private Property property(User owner, User agent, String title, PropertyType type, String bhk,
                              String city, String state, String pincode, double areaSqft, long price,
                              PossessionStatus possession, ListingStatus status, String rera, String... amenities) {
        return Property.builder()
                .ownerId(owner.getUserId())
                .agentId(agent == null ? null : agent.getUserId())
                .title(title)
                .propertyType(type)
                .bhkConfig(bhk)
                .carpetAreaSqft(areaSqft)
                .price(BigDecimal.valueOf(price))
                .city(city)
                .state(state)
                .pincode(pincode)
                .address(city + " Demo Address")
                .possessionStatus(possession)
                .reraNumber(rera)
                .listingStatus(status)
                .amenities(List.of(amenities))
                .viewCount(0L)
                .build();
    }

    private Enquiry enquiry(UUID propertyId, User agent, String name, String mobile, LeadStage stage, int score) {
        return Enquiry.builder()
                .propertyId(propertyId)
                .agentId(agent.getUserId())
                .buyerName(name)
                .buyerMobile(mobile)
                .otpVerified(true)
                .stage(stage)
                .leadScore(score)
                .build();
    }

    private CrmNote note(Enquiry enquiry, User agent, String text, LocalDate followUp) {
        return CrmNote.builder()
                .enquiryId(enquiry.getEnquiryId())
                .agentId(agent.getUserId())
                .noteText(text)
                .followUpDate(followUp)
                .followUpMode("CALL")
                .build();
    }
}
