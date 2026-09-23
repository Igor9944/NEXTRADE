-- Add profile fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS nom VARCHAR(100),
ADD COLUMN IF NOT EXISTS prenom VARCHAR(100),
ADD COLUMN IF NOT EXISTS adresse TEXT,
ADD COLUMN IF NOT EXISTS ville VARCHAR(100),
ADD COLUMN IF NOT EXISTS pays VARCHAR(100);

-- Comments for documentation
COMMENT ON COLUMN users.nom IS 'Last name / Nom de famille';
COMMENT ON COLUMN users.prenom IS 'First name / Prénom';
COMMENT ON COLUMN users.adresse IS 'Address / Adresse';
COMMENT ON COLUMN users.ville IS 'City / Ville';
COMMENT ON COLUMN users.pays IS 'Country / Pays';
