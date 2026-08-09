-- ============================================================================
-- EstateHub — Real Estate Property Management & Transaction System
-- SRS-34 v1.0 | Initial schema migration
-- Extends Appendix B with junction/audit tables flagged as gaps in review.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    user_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(100) NOT NULL,
    mobile            VARCHAR(15) NOT NULL UNIQUE,
    email             VARCHAR(150),
    password_hash     VARCHAR(255) NOT NULL,
    role              VARCHAR(20) NOT NULL CHECK (role IN ('SUPER_ADMIN','BUILDER_OWNER','AGENT','BUYER_TENANT')),
    aadhaar_encrypted VARCHAR(500),
    pan_encrypted     VARCHAR(500),
    kyc_verified      BOOLEAN NOT NULL DEFAULT FALSE,
    active            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- properties
-- ---------------------------------------------------------------------------
CREATE TABLE properties (
    property_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id                UUID NOT NULL REFERENCES users(user_id),
    agent_id                UUID REFERENCES users(user_id),
    title                   VARCHAR(200) NOT NULL,
    property_type           VARCHAR(30) NOT NULL,
    bhk_config              VARCHAR(20),
    carpet_area_sqft        DOUBLE PRECISION NOT NULL CHECK (carpet_area_sqft > 0),
    built_up_area_sqft      DOUBLE PRECISION,
    floor_number            INT,
    total_floors            INT,
    price                   DECIMAL(14,2) NOT NULL CHECK (price > 0),
    monthly_rent            DECIMAL(12,2),
    price_per_sqft          DECIMAL(10,2),
    negotiable              BOOLEAN NOT NULL DEFAULT FALSE,
    maintenance_charges     DECIMAL(10,2),
    address                 VARCHAR(300),
    pincode                 VARCHAR(10),
    city                    VARCHAR(100),
    state                   VARCHAR(100),
    landmark                VARCHAR(200),
    latitude                DOUBLE PRECISION,
    longitude               DOUBLE PRECISION,
    rera_number             VARCHAR(50),
    project_completion_date DATE,
    possession_status       VARCHAR(30) NOT NULL,
    possession_date         DATE,
    listing_status          VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL',
    rejection_reason        VARCHAR(500),
    view_count              BIGINT NOT NULL DEFAULT 0,
    created_at              TIMESTAMP NOT NULL DEFAULT now(),
    updated_at              TIMESTAMP,
    CONSTRAINT chk_rera_required_under_construction CHECK (
        possession_status <> 'UNDER_CONSTRUCTION' OR rera_number IS NOT NULL
    )
);

CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_status ON properties(listing_status);
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_price ON properties(price);

CREATE TABLE property_amenities (
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    amenity     VARCHAR(50) NOT NULL
);

-- ---------------------------------------------------------------------------
-- property_media
-- ---------------------------------------------------------------------------
CREATE TABLE property_media (
    media_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id         UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    media_type          VARCHAR(30) NOT NULL CHECK (media_type IN ('PHOTO','FLOOR_PLAN','VIRTUAL_TOUR_360','VIDEO_TOUR','DRONE_VIEW')),
    s3_key              VARCHAR(500) NOT NULL,
    alt_text            VARCHAR(200),
    is_cover_photo      BOOLEAN NOT NULL DEFAULT FALSE,
    display_order       INT,
    external_video_url  VARCHAR(500),
    created_at          TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_property ON property_media(property_id);

-- ---------------------------------------------------------------------------
-- enquiries
-- ---------------------------------------------------------------------------
CREATE TABLE enquiries (
    enquiry_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id     UUID NOT NULL REFERENCES properties(property_id),
    agent_id        UUID REFERENCES users(user_id),
    buyer_name      VARCHAR(100) NOT NULL,
    buyer_mobile    VARCHAR(15) NOT NULL,
    otp_verified    BOOLEAN NOT NULL DEFAULT FALSE,
    stage           VARCHAR(30) NOT NULL DEFAULT 'NEW'
                    CHECK (stage IN ('NEW','CONTACTED','SITE_VISIT_SCHEDULED','SITE_VISIT_DONE','NEGOTIATION','CONVERTED','LOST')),
    lead_score      INT NOT NULL DEFAULT 0,
    site_visit_slot TIMESTAMP,
    lost_reason     VARCHAR(300),
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP
);

CREATE INDEX idx_enquiries_agent ON enquiries(agent_id);
CREATE INDEX idx_enquiries_mobile_created ON enquiries(buyer_mobile, created_at); -- for rate limiting (5/hr)

-- ---------------------------------------------------------------------------
-- crm_notes
-- ---------------------------------------------------------------------------
CREATE TABLE crm_notes (
    note_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_id     UUID NOT NULL REFERENCES enquiries(enquiry_id) ON DELETE CASCADE,
    agent_id       UUID NOT NULL REFERENCES users(user_id),
    note_text      TEXT NOT NULL,
    follow_up_date DATE,
    follow_up_mode VARCHAR(20),
    created_at     TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_crm_notes_enquiry ON crm_notes(enquiry_id);

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------
CREATE TABLE bookings (
    booking_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id           UUID NOT NULL REFERENCES properties(property_id),
    buyer_id              UUID NOT NULL REFERENCES users(user_id),
    token_amount           DECIMAL(10,2) NOT NULL CHECK (token_amount > 0),
    status                VARCHAR(30) NOT NULL DEFAULT 'PENDING_PAYMENT'
                           CHECK (status IN ('PENDING_PAYMENT','CONFIRMED','CANCELLED','CONVERTED_TO_SALE')),
    razorpay_order_id     VARCHAR(100),
    razorpay_payment_id   VARCHAR(100),
    booking_slip_s3_key   VARCHAR(500),
    cancelled_at          TIMESTAMP,
    refund_amount         DECIMAL(10,2),
    created_at            TIMESTAMP NOT NULL DEFAULT now(),
    updated_at            TIMESTAMP
);

-- Enforces "only one active booking per property" at the DB layer too (Appendix C/F)
CREATE UNIQUE INDEX uq_one_active_booking_per_property
    ON bookings(property_id) WHERE status = 'CONFIRMED';

CREATE INDEX idx_bookings_buyer ON bookings(buyer_id);

-- ---------------------------------------------------------------------------
-- agreements
-- ---------------------------------------------------------------------------
CREATE TABLE agreements (
    agreement_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id            UUID NOT NULL REFERENCES properties(property_id),
    agreement_type         VARCHAR(20) NOT NULL CHECK (agreement_type IN ('SALE','RENT','ADDENDUM')),
    parties                TEXT,
    consideration_amount   DECIMAL(14,2),
    possession_date        DATE,
    start_date             DATE,
    end_date               DATE,
    status                 VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
                            CHECK (status IN ('DRAFT','SENT_FOR_SIGNING','PARTIALLY_SIGNED','EXECUTED','LAPSED')),
    digio_document_id      VARCHAR(100),
    signed_document_s3_key VARCHAR(500),
    parent_agreement_id    UUID REFERENCES agreements(agreement_id),
    created_at             TIMESTAMP NOT NULL DEFAULT now(),
    updated_at             TIMESTAMP,
    CONSTRAINT chk_agreement_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date > start_date)
);

CREATE INDEX idx_agreements_property ON agreements(property_id);

-- ---------------------------------------------------------------------------
-- tenancies
-- ---------------------------------------------------------------------------
CREATE TABLE tenancies (
    tenancy_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id       UUID NOT NULL REFERENCES properties(property_id),
    agreement_id      UUID NOT NULL REFERENCES agreements(agreement_id),
    tenant_id         UUID NOT NULL REFERENCES users(user_id),
    monthly_rent      DECIMAL(12,2) NOT NULL,
    rent_due_day      INT NOT NULL CHECK (rent_due_day BETWEEN 1 AND 28),
    grace_period_days INT DEFAULT 5,
    late_fee_flat     DECIMAL(8,2),
    late_fee_percent  DECIMAL(5,2),
    start_date        DATE NOT NULL,
    end_date          DATE,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP NOT NULL DEFAULT now()
);

-- Enforces "one active tenancy per property" at the DB layer (mirrors TenancyOverlapException)
CREATE UNIQUE INDEX uq_one_active_tenancy_per_property
    ON tenancies(property_id) WHERE is_active = TRUE;

CREATE INDEX idx_tenancies_tenant ON tenancies(tenant_id);

-- ---------------------------------------------------------------------------
-- rent_invoices
-- ---------------------------------------------------------------------------
CREATE TABLE rent_invoices (
    invoice_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenancy_id            UUID NOT NULL REFERENCES tenancies(tenancy_id),
    invoice_date          DATE NOT NULL,
    due_date              DATE NOT NULL,
    amount                DECIMAL(12,2) NOT NULL,
    gst_amount            DECIMAL(10,2),
    tds_applicable        BOOLEAN NOT NULL DEFAULT FALSE,
    tds_amount            DECIMAL(10,2),
    late_fee_applied      DECIMAL(8,2),
    status                VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                           CHECK (status IN ('PENDING','PAID','OVERDUE','LATE_FEE_APPLIED')),
    razorpay_payment_link VARCHAR(500),
    paid_at               TIMESTAMP,
    created_at            TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_tenancy ON rent_invoices(tenancy_id);
CREATE INDEX idx_invoices_status ON rent_invoices(status);

-- ---------------------------------------------------------------------------
-- maintenance_tickets
-- ---------------------------------------------------------------------------
CREATE TABLE maintenance_tickets (
    ticket_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id       UUID NOT NULL REFERENCES properties(property_id),
    tenant_id         UUID NOT NULL REFERENCES users(user_id),
    category          VARCHAR(50) NOT NULL CHECK (category IN ('PLUMBING','ELECTRICAL','CARPENTRY','PAINTING','PEST_CONTROL','LIFT','COMMON_AREA')),
    description       TEXT NOT NULL,
    contractor_name   VARCHAR(100),
    contractor_mobile VARCHAR(15),
    status            VARCHAR(30) NOT NULL DEFAULT 'OPEN'
                       CHECK (status IN ('OPEN','ACKNOWLEDGED','CONTRACTOR_ASSIGNED','VISIT_SCHEDULED','RESOLVED','DISPUTED','CLOSED')),
    resolution_date   DATE,
    cost              DECIMAL(8,2),
    created_at        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE ticket_photos (
    ticket_id UUID NOT NULL REFERENCES maintenance_tickets(ticket_id) ON DELETE CASCADE,
    s3_key    VARCHAR(300) NOT NULL
);

CREATE INDEX idx_tickets_property ON maintenance_tickets(property_id);

-- ---------------------------------------------------------------------------
-- property_documents + supporting vault tables
-- ---------------------------------------------------------------------------
CREATE TABLE property_documents (
    doc_id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id             UUID NOT NULL REFERENCES properties(property_id),
    doc_type                VARCHAR(50) NOT NULL CHECK (doc_type IN ('TITLE_DEED','SALE_DEED','ENCUMBRANCE_CERTIFICATE','KHATA','NOC','RERA_CERTIFICATE','FLOOR_PLAN')),
    s3_key                  VARCHAR(500) NOT NULL,
    verified                BOOLEAN NOT NULL DEFAULT FALSE,
    expiry_date             DATE,
    version                 INT NOT NULL DEFAULT 1,
    previous_version_doc_id UUID REFERENCES property_documents(doc_id),
    created_at              TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_property ON property_documents(property_id);

-- Gap-fill: document sharing was described in FR9 prose but had no table in Appendix B
CREATE TABLE document_shares (
    share_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_id            UUID NOT NULL REFERENCES property_documents(doc_id) ON DELETE CASCADE,
    shared_with_email VARCHAR(150) NOT NULL,
    shared_by_user_id UUID NOT NULL REFERENCES users(user_id),
    expires_at        TIMESTAMP NOT NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT now()
);

-- Gap-fill: audit log for document access, required by FR9 ("every document access ... logged")
CREATE TABLE document_access_log (
    log_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_id             UUID NOT NULL REFERENCES property_documents(doc_id),
    accessed_by_user_id UUID REFERENCES users(user_id),
    action             VARCHAR(20) NOT NULL,
    ip_address         VARCHAR(45),
    accessed_at        TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- saved_searches
-- ---------------------------------------------------------------------------
CREATE TABLE saved_searches (
    search_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id         UUID NOT NULL REFERENCES users(user_id),
    search_criteria  JSONB NOT NULL,
    last_notified_at TIMESTAMP,
    created_at       TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Gap-fill: shortlist / comparison junction table (FR2 — "buyer shortlists properties")
-- ---------------------------------------------------------------------------
CREATE TABLE shortlists (
    shortlist_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id     UUID NOT NULL REFERENCES users(user_id),
    property_id  UUID NOT NULL REFERENCES properties(property_id),
    created_at   TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (buyer_id, property_id)
);

-- ---------------------------------------------------------------------------
-- Gap-fill: immutable admin audit trail (FR12 — "all admin actions ... logged immutably")
-- ---------------------------------------------------------------------------
CREATE TABLE audit_log (
    audit_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id  UUID NOT NULL REFERENCES users(user_id),
    action         VARCHAR(100) NOT NULL,
    entity_type    VARCHAR(50),
    entity_id      UUID,
    details        TEXT,
    created_at     TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_actor ON audit_log(actor_user_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
