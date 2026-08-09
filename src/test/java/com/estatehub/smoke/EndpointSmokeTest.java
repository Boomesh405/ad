package com.estatehub.smoke;

import com.estatehub.base.BaseIntegrationTest;
import com.estatehub.entity.enums.Role;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class EndpointSmokeTest extends BaseIntegrationTest {

    @Test
    void buyerCanListOwnBookings() throws Exception {
        var buyer = register(Role.BUYER_TENANT);
        mockMvc.perform(withAuth(get("/api/v1/bookings/mine"), buyer.auth()))
                .andExpect(status().isOk());
    }

    @Test
    void buyerCannotListAdminProperties() throws Exception {
        var buyer = register(Role.BUYER_TENANT);
        mockMvc.perform(withAuth(get("/api/v1/admin/properties"), buyer.auth()))
                .andExpect(status().isForbidden());
    }
}
