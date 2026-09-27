-- Extend documents and invoices; add history; do not replace existing tables

CREATE TABLE IF NOT EXISTS document_reference_counters (
    year INTEGER PRIMARY KEY,
    last_value INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS invoice_reference_counters (
    year INTEGER PRIMARY KEY,
    last_value INTEGER NOT NULL
);

ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS reference_document VARCHAR(32),
    ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS file_size INTEGER,
    ADD COLUMN IF NOT EXISTS storage_key TEXT,
    ADD COLUMN IF NOT EXISTS uploaded_by UUID,
    ADD COLUMN IF NOT EXISTS id_shipment UUID,
    ADD COLUMN IF NOT EXISTS original_file_name VARCHAR(255);

UPDATE documents
SET original_file_name = COALESCE(original_file_name, nom_fichier)
WHERE original_file_name IS NULL;

UPDATE documents
SET storage_key = COALESCE(storage_key, chemin_fichier)
WHERE storage_key IS NULL;

WITH numbered AS (
    SELECT id_document,
           'DOC-' || TO_CHAR(COALESCE(created_at, CURRENT_TIMESTAMP), 'YYYY') || '-' ||
           LPAD(ROW_NUMBER() OVER (ORDER BY created_at, id_document)::TEXT, 6, '0') AS generated_ref
    FROM documents
    WHERE reference_document IS NULL OR BTRIM(reference_document) = ''
)
UPDATE documents d
SET reference_document = numbered.generated_ref
FROM numbered
WHERE d.id_document = numbered.id_document;

INSERT INTO document_reference_counters (year, last_value)
SELECT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, COALESCE((SELECT COUNT(*) FROM documents), 0)
ON CONFLICT (year) DO NOTHING;

ALTER TABLE documents ALTER COLUMN reference_document SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_documents_reference ON documents (reference_document);
CREATE INDEX IF NOT EXISTS idx_documents_order ON documents (id_order);
CREATE INDEX IF NOT EXISTS idx_documents_operation ON documents (id_operation);
CREATE INDEX IF NOT EXISTS idx_documents_shipment ON documents (id_shipment);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents (type_document);
CREATE INDEX IF NOT EXISTS idx_documents_statut ON documents (statut);

ALTER TABLE documents DROP CONSTRAINT IF EXISTS fk_documents_uploaded_by;
ALTER TABLE documents
    ADD CONSTRAINT fk_documents_uploaded_by
    FOREIGN KEY (uploaded_by) REFERENCES users(id_user) ON DELETE SET NULL;

ALTER TABLE documents DROP CONSTRAINT IF EXISTS fk_documents_shipment;
ALTER TABLE documents
    ADD CONSTRAINT fk_documents_shipment
    FOREIGN KEY (id_shipment) REFERENCES shipments(id_shipment) ON DELETE SET NULL;

ALTER TABLE invoices
    ADD COLUMN IF NOT EXISTS id_client UUID,
    ADD COLUMN IF NOT EXISTS devise VARCHAR(10) DEFAULT 'XOF',
    ADD COLUMN IF NOT EXISTS id_document UUID,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

UPDATE invoices i
SET id_client = o.id_client
FROM orders o
WHERE i.id_order = o.id_order AND i.id_client IS NULL;

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS fk_invoices_client;
ALTER TABLE invoices
    ADD CONSTRAINT fk_invoices_client
    FOREIGN KEY (id_client) REFERENCES users(id_user) ON DELETE RESTRICT;

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS fk_invoices_document;
ALTER TABLE invoices
    ADD CONSTRAINT fk_invoices_document
    FOREIGN KEY (id_document) REFERENCES documents(id_document) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_invoices_active_order
    ON invoices (id_order)
    WHERE statut <> 'ANNULEE';

CREATE INDEX IF NOT EXISTS idx_invoices_statut ON invoices (statut);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices (id_client);

INSERT INTO invoice_reference_counters (year, last_value)
SELECT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, COALESCE((SELECT COUNT(*) FROM invoices), 0)
ON CONFLICT (year) DO NOTHING;

CREATE TABLE IF NOT EXISTS document_history (
    id_history UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_document UUID NOT NULL REFERENCES documents(id_document) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by UUID REFERENCES users(id_user) ON DELETE SET NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_document_history_document ON document_history (id_document);

CREATE TABLE IF NOT EXISTS invoice_history (
    id_history UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_invoice UUID NOT NULL REFERENCES invoices(id_invoice) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by UUID REFERENCES users(id_user) ON DELETE SET NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoice_history_invoice ON invoice_history (id_invoice);

CREATE TABLE IF NOT EXISTS formality_history (
    id_history UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_formality UUID NOT NULL REFERENCES customs_formalities(id_formality) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id_user) ON DELETE SET NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_formality_history_formality ON formality_history (id_formality);
