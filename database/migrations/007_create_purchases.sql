-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id_purchase UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_fournisseur UUID NOT NULL,
    statut VARCHAR(50) NOT NULL CHECK (statut IN ('EN_ATTENTE', 'VALIDEE', 'ANNULEE')),
    montant_total DECIMAL(12,2) NOT NULL CHECK (montant_total >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_purchases_fournisseur
        FOREIGN KEY (id_fournisseur)
        REFERENCES users(id_user)
        ON DELETE RESTRICT
);

-- Trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
FOR EACH ROW EXECUTE PROCEDURE update_purchases_updated_at();
