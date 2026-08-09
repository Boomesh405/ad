package com.estatehub.postgres;

import com.estatehub.repository.UserRepository;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Boots the app with the DEFAULT profile against a real embedded PostgreSQL 16:
 * Flyway runs the V1 migration, then Hibernate validates the entities against the
 * migrated schema. This is the verification H2 cannot provide (JSONB columns,
 * pgcrypto extension, PostgreSQL-specific DDL, dialect).
 */
@SpringBootTest
@AutoConfigureMockMvc
class PostgresSmokeIT {

    private static final EmbeddedPostgres PG;

    static {
        try {
            PG = EmbeddedPostgres.builder().setPort(0).start();
            try (var conn = PG.getPostgresDatabase().getConnection();
                 var stmt = conn.createStatement()) {
                stmt.execute("CREATE ROLE estatehub_user LOGIN PASSWORD 'changeme' SUPERUSER");
                stmt.execute("CREATE DATABASE estatehub OWNER estatehub_user");
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to start embedded PostgreSQL", e);
        }
    }

    @DynamicPropertySource
    static void datasourceProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url",
                () -> "jdbc:postgresql://localhost:" + PG.getPort() + "/estatehub");
        registry.add("spring.datasource.username", () -> "estatehub_user");
        registry.add("spring.datasource.password", () -> "changeme");
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Test
    void contextBootsAndFlywayMigratedSchemaValidates() {
        // Context startup itself proves Flyway + ddl-auto validate succeeded.
        // Sanity check that the repository can query the migrated table.
        long count = userRepository.count();
        org.assertj.core.api.Assertions.assertThat(count).isEqualTo(0);
    }

    @Test
    void publicEndpointsWorkOnPostgres() throws Exception {
        mockMvc.perform(get("/api/v1/properties/search").param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").isNumber());
    }

    @AfterAll
    static void tearDown() throws Exception {
        PG.close();
    }
}
