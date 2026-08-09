package com.estatehub.property;

import com.estatehub.base.BaseIntegrationTest;
import com.estatehub.dto.AuthResponse;
import com.estatehub.entity.Property;
import com.estatehub.entity.PropertyMedia;
import com.estatehub.entity.enums.PossessionStatus;
import com.estatehub.entity.enums.Role;
import com.estatehub.repository.PropertyMediaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PropertyListingIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private PropertyMediaRepository propertyMediaRepository;

    @Test
    void unverifiedAgentCannotCreateListing() throws Exception {
        AuthResponse agent = register(Role.AGENT).auth(); // agents start with kycVerified=false

        mockMvc.perform(withAuth(post("/api/v1/properties"), agent)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newProperty(agent.getUserId(), "Mumbai"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title").value("Agent KYC Incomplete"));
    }

    @Test
    void ownerCreatesListingAsPendingApproval() throws Exception {
        AuthResponse owner = register(Role.BUILDER_OWNER).auth();

        mockMvc.perform(withAuth(post("/api/v1/properties"), owner)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newProperty(owner.getUserId(), "Delhi"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.propertyId").isNotEmpty())
                .andExpect(jsonPath("$.listingStatus").value("PENDING_APPROVAL"))
                .andExpect(jsonPath("$.ownerId").value(owner.getUserId()));
    }

    @Test
    void underConstructionListingRequiresReraNumber() throws Exception {
        AuthResponse owner = register(Role.BUILDER_OWNER).auth();
        Property property = newProperty(owner.getUserId(), "Pune");
        property.setPossessionStatus(PossessionStatus.UNDER_CONSTRUCTION);

        mockMvc.perform(withAuth(post("/api/v1/properties"), owner)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(property)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("RERA Number Required"));
    }

    @Test
    void activationRequiresAtLeastThreePhotos() throws Exception {
        AuthResponse owner = register(Role.BUILDER_OWNER).auth();
        String propertyId = createProperty(owner);

        mockMvc.perform(withAuth(post("/api/v1/properties/" + propertyId + "/activate"), owner))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Insufficient Photos"));
    }

    @Test
    void ownerCannotActivateAnotherOwnersListing() throws Exception {
        AuthResponse owner1 = register(Role.BUILDER_OWNER).auth();
        String propertyId = createProperty(owner1);
        AuthResponse owner2 = register(Role.BUILDER_OWNER).auth();

        mockMvc.perform(withAuth(post("/api/v1/properties/" + propertyId + "/activate"), owner2))
                .andExpect(status().isForbidden());
    }

    @Test
    void activationSucceedsWithThreePhotos() throws Exception {
        AuthResponse owner = register(Role.BUILDER_OWNER).auth();
        String propertyId = createProperty(owner);
        addPhotos(propertyId, 3);

        mockMvc.perform(withAuth(post("/api/v1/properties/" + propertyId + "/activate"), owner))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.listingStatus").value("ACTIVE"));
    }

    @Test
    void publicSearchFindsActiveListings() throws Exception {
        AuthResponse owner = register(Role.BUILDER_OWNER).auth();
        // Unique city so this test's count assertion stays independent of other tests' data
        String propertyId = createProperty(owner, "Indore");
        addPhotos(propertyId, 3);
        mockMvc.perform(withAuth(post("/api/v1/properties/" + propertyId + "/activate"), owner))
                .andExpect(status().isOk());

        // Search is permitAll - no token needed
        mockMvc.perform(get("/api/v1/properties/search").param("city", "Indore"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].listingStatus").value("ACTIVE"));
    }

    @Test
    void unauthenticatedCreateIsRejected() throws Exception {
        mockMvc.perform(post("/api/v1/properties")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newProperty(UUID.randomUUID().toString(), "Chennai"))))
                .andExpect(status().isForbidden());
    }

    private void addPhotos(String propertyId, int count) {
        UUID pid = UUID.fromString(propertyId);
        for (int i = 0; i < count; i++) {
            propertyMediaRepository.save(PropertyMedia.builder()
                    .propertyId(pid)
                    .mediaType(com.estatehub.entity.enums.MediaType.PHOTO)
                    .s3Key("s3://estatehub-documents/photos/" + propertyId + "/" + i + ".jpg")
                    .build());
        }
    }
}
