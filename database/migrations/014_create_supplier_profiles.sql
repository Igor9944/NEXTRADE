-- Supplier profiles table for business information
CREATE TABLE IF NOT EXISTS supplier_profiles (
    id_supplier_profile UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    description TEXT,
    identifiant_professionnel VARCHAR(100),
    statut_verification VARCHAR(50) NOT NULL DEFAULT 'NON_VERIFIE' CHECK (statut_verification IN ('NON_VERIFIE', 'EN_ATTENTE', 'VERIFIE', 'REJETE')),
    date_verification TIMESTAMP WITH TIME ZONE,
    email_professionnel VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_supplier_profiles_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_supplier_profiles_updated_at BEFORE UPDATE ON supplier_profiles
FOR EACH ROW EXECUTE PROCEDURE update_supplier_profiles_updated_at_column();

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_supplier_profiles_user_id ON supplier_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_supplier_profiles_statut ON supplier_profiles(statut_verification);
CREATE INDEX IF NOT EXISTS idx_supplier_profiles_identifiant ON supplier_profiles(identifiant_professionnel);
CREATE INDEX IF NOT EXISTS idx_supplier_profiles_email_pro ON supplier_profiles(email_professionnel);

-- Comments for documentation
COMMENT ON TABLE supplier_profiles IS 'Supplier profile containing business-specific information';
COMMENT ON COLUMN supplier_profiles.description IS 'Business description / Description de l''entreprise';
COMMENT ON COLUMN supplier_profiles.identifiant_professionnel IS 'Professional identifier (SIRET, TVA, etc.) / Identifiant professionnel';
COMMENT ON COLUMN supplier_profiles.statut_verification IS 'Verification status: NON_VERIFIE, EN_ATTENTE, VERIFIE, REJETE / Statut de vérification';
COMMENT ON COLUMN supplier_profiles.date_verification IS 'Date of verification / Date de vérification';
COMMENT ON COLUMN supplier_profiles.email_professionnel IS 'Professional email address / Email professionnel';
