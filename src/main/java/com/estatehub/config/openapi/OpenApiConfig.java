package com.estatehub.config.openapi;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI metadata for Swagger UI. Declares a global HTTP bearer security
 * scheme so the "Authorize" button appears and the JWT access token can be
 * sent with protected requests.
 */
@Configuration
public class OpenApiConfig {

    private static final String SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI estateHubOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("EstateHub API")
                        .version("1.0.0")
                        .description("EstateHub backend API. Authenticate via the /api/v1/auth/login "
                                + "endpoint and paste the returned accessToken into Authorize "
                                + "as 'Bearer <token>'."))
                .components(new Components().addSecuritySchemes(SCHEME_NAME,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList(SCHEME_NAME));
    }
}
