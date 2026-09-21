-- Create import_export_operations table
CREATE TABLE IF NOT EXISTS import_export_operations (
    id_operation UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_operation VARCHAR(10) NOT NULL CHECK (type_operation IN ('IMPORT', 'EXPORT')),
    id_order UUID NOT NULL,
    pays_origine VARCHAR(100),
    pays_destination VARCHAR(100),
    statut VARCHAR(50) NOT NULL CHECK (statut IN ('PREPARATION', 'EXPEDIEE', 'EN_TRANSIT', 'ARRIVEE', 'DOUANE', 'LIVREE', 'ANNULEE')),
    date_depart DATE,
    date_arrivee_prevue DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_import_export_order
        FOREIGN KEY (id_order)
        REFERENCES orders(id_order)
        ON DELETE RESTRICT
);

-- Trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_import_export_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_import_export_updated_at BEFORE UPDATE ON import_export_operations
FOR EACH ROW EXECUTE PROCEDURE update_import_export_updated_at();
