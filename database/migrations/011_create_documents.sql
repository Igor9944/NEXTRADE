-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id_document UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_operation UUID,
    id_order UUID,
    type_document VARCHAR(50) NOT NULL CHECK (type_document IN ('FACTURE_COMMERCIALE', 'PACKING_LIST', 'CERTIFICAT_ORIGINE', 'DOCUMENT_DOUANE', 'DOCUMENT_TRANSPORT', 'AUTRE')),
    nom_fichier VARCHAR(255),
    chemin_fichier VARCHAR(255),
    statut VARCHAR(50) NOT NULL CHECK (statut IN ('ACTIF', 'ARCHIVE', 'SUPPRIME')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_documents_operation
        FOREIGN KEY (id_operation)
        REFERENCES import_export_operations(id_operation)
        ON DELETE SET NULL,
    CONSTRAINT fk_documents_order
        FOREIGN KEY (id_order)
        REFERENCES orders(id_order)
        ON DELETE SET NULL
);

-- Trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE PROCEDURE update_documents_updated_at();
