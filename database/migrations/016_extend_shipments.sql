-- Extend existing shipments table (do not replace it)
-- Unique shipment references, extra logistics fields, transit statuses, history

CREATE TABLE IF NOT EXISTS shipment_reference_counters (
    year INTEGER PRIMARY KEY,
    last_value INTEGER NOT NULL
);

ALTER TABLE shipments
    ADD COLUMN IF NOT EXISTS reference_shipment VARCHAR(32),
    ADD COLUMN IF NOT EXISTS origin TEXT,
    ADD COLUMN IF NOT EXISTS destination TEXT,
    ADD COLUMN IF NOT EXISTS shipping_address TEXT,
    ADD COLUMN IF NOT EXISTS date_preparation TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS recipient_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS delivery_notes TEXT;

UPDATE shipments
SET date_preparation = COALESCE(date_preparation, created_at)
WHERE date_preparation IS NULL;

UPDATE shipments
SET shipping_address = COALESCE(shipping_address, (
    SELECT o.adresse_livraison FROM orders o WHERE o.id_order = shipments.id_order
))
WHERE shipping_address IS NULL;

WITH numbered AS (
    SELECT
        id_shipment,
        'SHP-' || TO_CHAR(COALESCE(created_at, CURRENT_TIMESTAMP), 'YYYY') || '-' ||
        LPAD(ROW_NUMBER() OVER (ORDER BY created_at, id_shipment)::TEXT, 6, '0') AS generated_ref
    FROM shipments
    WHERE reference_shipment IS NULL OR BTRIM(reference_shipment) = ''
)
UPDATE shipments s
SET reference_shipment = numbered.generated_ref
FROM numbered
WHERE s.id_shipment = numbered.id_shipment;

INSERT INTO shipment_reference_counters (year, last_value)
SELECT
    EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
    COALESCE((
        SELECT COUNT(*) FROM shipments
        WHERE reference_shipment LIKE 'SHP-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-%'
    ), 0)
ON CONFLICT (year) DO NOTHING;

ALTER TABLE shipments
    ALTER COLUMN reference_shipment SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_shipments_reference_shipment
    ON shipments (reference_shipment);

ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_statut_check;

ALTER TABLE shipments
    ADD CONSTRAINT shipments_statut_check
    CHECK (statut IN (
        'PREPARATION',
        'PRISE_EN_CHARGE',
        'EXPEDIEE',
        'EN_TRANSIT',
        'ARRIVEE',
        'ARRIVEE_AGENCE',
        'DOUANE',
        'EN_LIVRAISON',
        'LIVREE',
        'ECHEC_LIVRAISON',
        'ANNULEE'
    ));

CREATE INDEX IF NOT EXISTS idx_shipments_statut ON shipments (statut);
CREATE INDEX IF NOT EXISTS idx_shipments_numero_suivi ON shipments (numero_suivi);
CREATE INDEX IF NOT EXISTS idx_shipments_reference ON shipments (reference_shipment);
CREATE INDEX IF NOT EXISTS fk_shipments_order_idx ON shipments (id_order);
CREATE INDEX IF NOT EXISTS fk_shipments_transporteur_idx ON shipments (transporteur_id);

CREATE TABLE IF NOT EXISTS shipment_status_history (
    id_history UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_shipment UUID NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shipment_status_history_shipment
        FOREIGN KEY (id_shipment)
        REFERENCES shipments(id_shipment)
        ON DELETE CASCADE,
    CONSTRAINT fk_shipment_status_history_user
        FOREIGN KEY (changed_by)
        REFERENCES users(id_user)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_shipment_status_history_shipment
    ON shipment_status_history (id_shipment);
CREATE INDEX IF NOT EXISTS idx_shipment_status_history_created_at
    ON shipment_status_history (created_at);

CREATE TABLE IF NOT EXISTS order_status_history (
    id_status_history UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_order UUID NOT NULL REFERENCES orders(id_order) ON DELETE CASCADE,
    statut VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
