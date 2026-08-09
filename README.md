# EstateHub

Real-estate property management & transaction platform (SRS-34): a Spring Boot 3.3
REST API + PostgreSQL (Flyway-managed schema) + a React 19 SPA.

## Stack

| Layer    | Tech                                                        |
|----------|-------------------------------------------------------------|
| Backend  | Java 17, Spring Boot 3.3, Spring Security (JWT), springdoc  |
| Database | PostgreSQL 16, Flyway migrations, Hibernate `validate`      |
| Frontend | React 19, Vite, react-router-dom, nginx (production)        |
| Payments | Razorpay webhook (HMAC-verified), Digio eSign webhook       |

## Quick start — Docker (production-style)

```bash
cp .env.example .env      # then edit .env (set DB_PASSWORD, JWT_SECRET)
docker compose up --build
```

- Web app:  **http://localhost:8080**
- API + Swagger UI: **http://localhost:8090/swagger-ui.html** (or `/api-docs`)
- PostgreSQL: `localhost:5432` (db `estatehub`, user `estatehub_user`)

The backend boots with Flyway migrations + Hibernate schema validation against
PostgreSQL; the frontend (nginx) proxies `/api` to the backend.

## Local development

Prerequisites: Java 17, Maven 3.9+, Node 20+, PostgreSQL 16 running locally.

```bash
# 1. create the database + user
psql -U postgres -c "CREATE USER estatehub_user WITH PASSWORD 'changeme' CREATEDB;"
psql -U postgres -c "CREATE DATABASE estatehub OWNER estatehub_user;"

# 2. backend (default profile: Flyway + validate on localhost:5432)
mvn spring-boot:run

# 3. frontend (dev server proxies /api to localhost:8080)
cd frontend
npm install
npm run dev               # http://localhost:5173
```

### Demo data (optional)

Run the backend with the `devdemo` profile for a seeded admin/owner/buyer and
sample listings (all with password `Demo@1234`):

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=test,devdemo -Dspring-boot.run.useTestClasspath=true
```

| Role  | Mobile     | Password  |
|-------|------------|-----------|
| Admin | 9000000001 | Demo@1234 |
| Owner | 9000000002 | Demo@1234 |
| Buyer | 9000000003 | Demo@1234 |

### Tests

```bash
mvn test     # 25 integration tests on H2 (full Spring context + security chain)

# Real-PostgreSQL verification (Flyway migration + ddl-auto validate + JSONB)
# Uses an embedded PostgreSQL 16 (io.zonky.test) — downloads binaries on first run.
mvn test -Dtest=PostgresSmokeIT
```

## Configuration

All secrets are environment variables (see `.env.example`). Key ones:

| Variable                  | Purpose                                    |
|---------------------------|--------------------------------------------|
| `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` | PostgreSQL connection      |
| `JWT_SECRET`              | HS512 signing key (≥64 bytes)              |
| `RAZORPAY_WEBHOOK_SECRET` | Verifies Razorpay `payment.captured` webhooks |
| `DIGIO_WEBHOOK_SECRET`    | Verifies Digio eSign webhooks              |
| `CORS_ORIGINS`            | Allowed browser origins for direct API calls |

## Security notes

- Identity comes from the signed JWT only; `SUPER_ADMIN` cannot self-register.
- Booking confirmation and agreement execution are reachable **only** via
  signature-verified webhooks (no public confirm/execute endpoints).
- `ddl-auto: validate` means the schema must match the entities — Flyway owns DDL.
