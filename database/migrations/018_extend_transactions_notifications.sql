-- Extend transactions for payment gateway metadata; do not replace the table

ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS provider VARCHAR(50),
    ADD COLUMN IF NOT EXISTS devise VARCHAR(10),
    ADD COLUMN IF NOT EXISTS provider_event_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_transactions_order ON transactions (id_order);
CREATE INDEX IF NOT EXISTS idx_transactions_statut ON transactions (statut_transaction);

CREATE UNIQUE INDEX IF NOT EXISTS uq_transactions_reference_externe
    ON transactions (reference_externe)
    WHERE reference_externe IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_transactions_provider_event
    ON transactions (provider_event_id)
    WHERE provider_event_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS notification_events (
    id_notification UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(80) NOT NULL,
    aggregate_id UUID NOT NULL,
    channel VARCHAR(40) NOT NULL,
    recipient VARCHAR(255),
    status VARCHAR(40) NOT NULL DEFAULT 'SENT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_type, aggregate_id, channel)
);

CREATE INDEX IF NOT EXISTS idx_notification_events_aggregate ON notification_events (aggregate_id);
