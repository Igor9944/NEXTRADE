-- Create purchase_items table
CREATE TABLE IF NOT EXISTS purchase_items (
    id_purchase_item UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_purchase UUID NOT NULL,
    id_product UUID NOT NULL,
    quantite INTEGER NOT NULL CHECK (quantite > 0),
    prix_unitaire DECIMAL(10,2) NOT NULL CHECK (prix_unitaire >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_purchase_items_purchase
        FOREIGN KEY (id_purchase)
        REFERENCES purchases(id_purchase)
        ON DELETE RESTRICT,
    CONSTRAINT fk_purchase_items_product
        FOREIGN KEY (id_product)
        REFERENCES products(id_product)
        ON DELETE RESTRICT
);
