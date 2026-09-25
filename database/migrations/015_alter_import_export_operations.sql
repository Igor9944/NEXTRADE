-- Alter import_export_operations to add new columns
ALTER TABLE import_export_operations 
  ALTER COLUMN id_order DROP NOT NULL,
  ADD COLUMN id_purchase UUID,
  ADD COLUMN reference_operation VARCHAR(50) UNIQUE,
  ADD COLUMN mode_transport VARCHAR(50),
  ADD COLUMN date_arrivee_reelle DATE;

-- Add check constraint for mode_transport
ALTER TABLE import_export_operations
  ADD CONSTRAINT chk_import_export_mode_transport
  CHECK (mode_transport IN ('MARITIME', 'AERIEN', 'ROUTIER', 'FERROVIAIRE', 'AUTRE') OR mode_transport IS NULL);

-- Add check constraint to ensure at least one of id_order or id_purchase is set
ALTER TABLE import_export_operations
  ADD CONSTRAINT chk_import_export_order_or_purchase
  CHECK (id_order IS NOT NULL OR id_purchase IS NOT NULL);

-- Add foreign key for id_purchase
ALTER TABLE import_export_operations
  ADD CONSTRAINT fk_import_export_purchase
  FOREIGN KEY (id_purchase)
  REFERENCES purchases(id_purchase)
  ON DELETE RESTRICT;

-- Create index on reference_operation for faster lookups
CREATE INDEX idx_import_export_operations_reference ON import_export_operations(reference_operation);

-- Create import_export_items table
CREATE TABLE IF NOT EXISTS import_export_items (
    id_item UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_operation UUID NOT NULL,
    id_product UUID NOT NULL,
    quantite INTEGER NOT NULL CHECK (quantite > 0),
    unite VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_import_export_items_operation
        FOREIGN KEY (id_operation)
        REFERENCES import_export_operations(id_operation)
        ON DELETE CASCADE,
    CONSTRAINT fk_import_export_items_product
        FOREIGN KEY (id_product)
        REFERENCES products(id_product)
        ON DELETE RESTRICT
);

-- Trigger to update updated_at column for import_export_items
CREATE OR REPLACE FUNCTION update_import_export_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_import_export_items_updated_at BEFORE UPDATE ON import_export_items
FOR EACH ROW EXECUTE PROCEDURE update_import_export_items_updated_at();

-- Create customs_formalities table
CREATE TABLE IF NOT EXISTS customs_formalities (
    id_formality UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_operation UUID NOT NULL,
    type_formality VARCHAR(100) NOT NULL,
    statut VARCHAR(50) NOT NULL CHECK (statut IN ('A_FAIRE', 'EN_COURS', 'TERMINE', 'BLOQUE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update updated_at column for customs_formalities
CREATE OR REPLACE FUNCTION update_customs_formalities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customs_formalities_updated_at BEFORE UPDATE ON customs_formalities
FOR EACH ROW EXECUTE PROCEDURE update_customs_formalities_updated_at();

-- Add foreign key for customs_formalities
ALTER TABLE customs_formalities
  ADD CONSTRAINT fk_customs_formalities_operation
  FOREIGN KEY (id_operation)
  REFERENCES import_export_operations(id_operation)
  ON DELETE CASCADE;

-- Create index on customs_formalities for operation
CREATE INDEX idx_customs_formalities_operation ON customs_formalities(id_operation);
