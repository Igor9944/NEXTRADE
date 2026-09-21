-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id_item UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_order UUID NOT NULL,
    id_product UUID NOT NULL,
    quantite INTEGER NOT NULL CHECK (quantite > 0),
    prix_unitaire_fige DECIMAL(10,2) NOT NULL CHECK (prix_unitaire_fige >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (id_order)
        REFERENCES orders(id_order)
        ON DELETE RESTRICT,
    CONSTRAINT fk_order_items_product
        FOREIGN KEY (id_product)
        REFERENCES products(id_product)
        ON DELETE RESTRICT
);
