-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id_product UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_fournisseur UUID NOT NULL,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    categorie VARCHAR(100),
    prix_detail DECIMAL(10,2) NOT NULL CHECK (prix_detail >= 0),
    prix_gros DECIMAL(10,2) NOT NULL CHECK (prix_gros >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_fournisseur
        FOREIGN KEY (id_fournisseur)
        REFERENCES users(id_user)
        ON DELETE RESTRICT
);

-- Trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column_products()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column_products();
