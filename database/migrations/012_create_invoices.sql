-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id_invoice UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_order UUID NOT NULL,
    numero_facture VARCHAR(50) NOT NULL UNIQUE,
    montant_ht DECIMAL(12,2) NOT NULL CHECK (montant_ht >= 0),
    montant_tva DECIMAL(12,2) NOT NULL CHECK (montant_tva >= 0),
    montant_ttc DECIMAL(12,2) NOT NULL CHECK (montant_ttc >= 0),
    statut VARCHAR(50) NOT NULL CHECK (statut IN ('BROUILLON', 'ENVOYEE', 'PAYEE', 'ANNULEE')),
    date_emission DATE,
    date_echeance DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoices_order
        FOREIGN KEY (id_order)
        REFERENCES orders(id_order)
        ON DELETE RESTRICT
);
