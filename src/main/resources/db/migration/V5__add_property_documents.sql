-- V5: Add property_documents table for owner-uploaded property documents
-- (title deeds, tax receipts, floor plans, etc.)

CREATE TABLE IF NOT EXISTS property_documents (
    document_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id   UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    uploaded_by   UUID NOT NULL REFERENCES users(user_id),
    doc_type      VARCHAR(50)  NOT NULL, -- TITLE_DEED, TAX_RECEIPT, ENCUMBRANCE_CERT, FLOOR_PLAN, APPROVAL_PLAN, OTHER
    doc_name      VARCHAR(200) NOT NULL,
    file_url      VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT,
    verified      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prop_docs_property ON property_documents(property_id);
