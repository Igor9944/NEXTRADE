-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id_order UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_client UUID NOT NULL,
    montant_total DECIMAL(12,2) NOT NULL CHECK (montant_total >= 0),
    statut VARCHAR(50) NOT NULL CHECK (statut IN ('EN_ATTENTE', 'PAYEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE', 'ANNULEE')),
    adresse_livraison TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_client
        FOREIGN KEY (id_client)
        REFERENCES users(id_user)
        ON DELETE RESTRICT
);

-- Trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE PROCEDURE update_orders_updated_at();
