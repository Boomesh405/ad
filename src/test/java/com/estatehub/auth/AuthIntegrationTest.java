package com.estatehub.auth;

import com.estatehub.base.BaseIntegrationTest;
import com.estatehub.dto.LoginRequest;
import com.estatehub.dto.RegisterRequest;
import com.estatehub.entity.enums.Role;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthIntegrationTest extends BaseIntegrationTest {

    @Test
    void registerCreatesAccountAndReturnsTokens() throws Exception {
        RegisterRequest request = registerRequest(uniqueMobile(), Role.BUYER_TENANT);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.userId").isNotEmpty())
                .andExpect(jsonPath("$.role").value("BUYER_TENANT"));
    }

    @Test
    void registerRejectsDuplicateMobile() throws Exception {
        String mobile = uniqueMobile();
        RegisterRequest request = registerRequest(mobile, Role.BUYER_TENANT);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Bad Request"))
                .andExpect(jsonPath("$.detail").value("Mobile number already registered"));
    }

    @Test
    void registerRejectsSelfRegisteredSuperAdmin() throws Exception {
        RegisterRequest request = registerRequest(uniqueMobile(), Role.SUPER_ADMIN);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("SUPER_ADMIN cannot be self-registered"));
    }

    @Test
    void loginSucceedsWithValidCredentials() throws Exception {
        Registered registered = register(Role.BUYER_TENANT);

        LoginRequest login = new LoginRequest();
        login.setMobile(registered.mobile());
        login.setPassword("Test@1234");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.role").value("BUYER_TENANT"));
    }

    @Test
    void loginFailsWithWrongPassword() throws Exception {
        Registered registered = register(Role.BUYER_TENANT);

        LoginRequest login = new LoginRequest();
        login.setMobile(registered.mobile());
        login.setPassword("wrong-password");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }
}
