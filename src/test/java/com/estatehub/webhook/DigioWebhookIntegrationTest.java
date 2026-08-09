package com.estatehub.webhook;

import com.estatehub.base.BaseIntegrationTest;
import com.estatehub.dto.AuthResponse;
import com.estatehub.entity.Agreement;
import com.estatehub.entity.enums.AgreementType;
import com.estatehub.entity.enums.Role;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class DigioWebhookIntegrationTest extends BaseIntegrationTest {

    @Test
    void webhookExecutesAgreementAfterAllSignersComplete() throws Exception {
        AuthResponse owner = register(Role.BUILDER_OWNER).auth();
        String propertyId = createProperty(owner);
        String agreementId = createAndSendAgreement(owner, propertyId, "DID_test_1");

        String body = "{\"eventType\":\"esign.document.webhook\",\"eventData\":{"
                + "\"documentSignId\":\"DID_test_1\",\"documentStatus\":\"COMPLETED\"}}";
        mockMvc.perform(post("/api/v1/digio/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .header("X-Digio-Checksum", digioChecksum(body)))
                .andExpect(status().isOk());

        mockMvc.perform(withAuth(get("/api/v1/agreements/" + agreementId), owner))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EXECUTED"));
    }

    @Test
    void webhookRejectsInvalidChecksum() throws Exception {
        AuthResponse owner = register(Role.BUILDER_OWNER).auth();
        String propertyId = createProperty(owner);
        String agreementId = createAndSendAgreement(owner, propertyId, "DID_test_2");

        String body = "{\"eventType\":\"esign.document.webhook\",\"eventData\":{"
                + "\"documentSignId\":\"DID_test_2\",\"documentStatus\":\"COMPLETED\"}}";
        mockMvc.perform(post("/api/v1/digio/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .header("X-Digio-Checksum", "deadbeef"))
                .andExpect(status().isUnauthorized());

        // the agreement stays SENT_FOR_SIGNING
        mockMvc.perform(withAuth(get("/api/v1/agreements/" + agreementId), owner))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SENT_FOR_SIGNING"));
    }

    private String createAndSendAgreement(AuthResponse owner, String propertyId, String digioDocumentId) throws Exception {
        Agreement agreement = new Agreement();
        agreement.setPropertyId(UUID.fromString(propertyId));
        agreement.setAgreementType(AgreementType.RENT);

        MvcResult created = mockMvc.perform(withAuth(post("/api/v1/agreements"), owner)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(agreement)))
                .andExpect(status().isCreated())
                .andReturn();
        String agreementId = objectMapper.readTree(created.getResponse().getContentAsString())
                .get("agreementId").asText();

        mockMvc.perform(withAuth(post("/api/v1/agreements/" + agreementId + "/send"), owner)
                        .param("digioDocumentId", digioDocumentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SENT_FOR_SIGNING"));

        return agreementId;
    }
}
