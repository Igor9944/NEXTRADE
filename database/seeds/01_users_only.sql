INSERT INTO users (id_user, email, password_hash, role, nom_entreprise, telephone) VALUES
-- Administrateur
('11111111-1111-1111-1111-111111111111', 'admin@nextrade.com', '$2a$10$hashedpassword', 'ADMIN', 'NexTrade Admin', '+33 1 23 45 67 89'),
-- Fournisseur
('22222222-2222-2222-2222-222222222222', 'fournisseur@nextrade.com', '$2a$10$hashedpassword', 'FOURNISSEUR', 'TechFournisseur Inc.', '+33 2 34 56 78 90');
