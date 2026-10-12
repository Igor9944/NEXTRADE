-- Enable UUID extension if not exists (already enabled in 001, but safe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id_category UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create product_categories junction table
CREATE TABLE IF NOT EXISTS product_categories (
    id_product UUID NOT NULL,
    id_category UUID NOT NULL,
    PRIMARY KEY (id_product, id_category),
    CONSTRAINT fk_product_categories_product FOREIGN KEY (id_product) REFERENCES products(id_product) ON DELETE CASCADE,
    CONSTRAINT fk_product_categories_category FOREIGN KEY (id_category) REFERENCES categories(id_category) ON DELETE CASCADE
);

-- Keep the trigger safe to recreate when validating this migration.
CREATE OR REPLACE FUNCTION update_updated_at_column_categories()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column_categories();
