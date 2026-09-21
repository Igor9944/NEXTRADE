-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id_transaction UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_order UUID NOT NULL,
    montant_paye DECIMAL(12,2) NOT NULL CHECK (montant_paye >= 0),
    methode_paiement VARCHAR(50),
    statut_transaction VARCHAR(50) NOT NULL CHECK (statut_transaction IN ('INITIEE', 'EN_ATTENTE', 'VALIDEE', 'ECHOUEE', 'REMBOURSEE')),
    reference_externe VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transactions_order
        FOREIGN KEY (id_order)
        REFERENCES orders(id_order)
        ON DELETE RESTRICT
);
