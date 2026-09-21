-- Create shipments table
CREATE TABLE IF NOT EXISTS shipments (
    id_shipment UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_order UUID NOT NULL,
    transporteur_id UUID,
    numero_suivi VARCHAR(100),
    mode_transport VARCHAR(50),
    statut VARCHAR(50) NOT NULL CHECK (statut IN ('PREPARATION', 'EXPEDIEE', 'EN_TRANSIT', 'ARRIVEE', 'DOUANE', 'LIVREE', 'ANNULEE')),
    date_expedition TIMESTAMP WITH TIME ZONE,
    date_livraison_estimee TIMESTAMP WITH TIME ZONE,
    date_livraison_reelle TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shipments_order
        FOREIGN KEY (id_order)
        REFERENCES orders(id_order)
        ON DELETE RESTRICT,
    CONSTRAINT fk_shipments_transporteur
        FOREIGN KEY (transporteur_id)
        REFERENCES users(id_user)
        ON DELETE SET NULL
);

-- Trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_shipments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
FOR EACH ROW EXECUTE PROCEDURE update_shipments_updated_at();
