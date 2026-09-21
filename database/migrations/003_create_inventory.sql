-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id_stock UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_product UUID NOT NULL UNIQUE,
    quantite_disponible INTEGER NOT NULL CHECK (quantite_disponible >= 0),
    seuil_alerte INTEGER NOT NULL CHECK (seuil_alerte >= 0),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_product
        FOREIGN KEY (id_product)
        REFERENCES products(id_product)
        ON DELETE RESTRICT
);

-- Trigger to update last_updated column
CREATE OR REPLACE FUNCTION update_inventory_last_updated()
RETURNS TRIGGER AS $$
BEGIN
   NEW.last_updated = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_last_updated BEFORE UPDATE ON inventory
FOR EACH ROW EXECUTE PROCEDURE update_inventory_last_updated();
