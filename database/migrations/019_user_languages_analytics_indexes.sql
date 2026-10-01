ALTER TABLE users
    ADD COLUMN IF NOT EXISTS ui_language VARCHAR(5) NOT NULL DEFAULT 'fr',
    ADD COLUMN IF NOT EXISTS assistant_language VARCHAR(5) NOT NULL DEFAULT 'fr';

ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_ui_language;
ALTER TABLE users ADD CONSTRAINT chk_users_ui_language
    CHECK (ui_language IN ('fr', 'en', 'ar'));

ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_assistant_language;
ALTER TABLE users ADD CONSTRAINT chk_users_assistant_language
    CHECK (assistant_language IN ('fr', 'en', 'ar'));

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_statut ON orders (statut);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items (id_product);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (id_order);
CREATE INDEX IF NOT EXISTS idx_transactions_statut ON transactions (statut_transaction);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_alert ON inventory (quantite_disponible, seuil_alerte);
CREATE INDEX IF NOT EXISTS idx_shipments_eta ON shipments (date_livraison_estimee);
