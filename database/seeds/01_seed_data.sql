-- Seed data for NexTrade demonstration
-- Insert data in order to respect foreign key constraints

-- 1. Users (administrateur, fournisseur, commerçant, 2 clients, transporteur)
INSERT INTO users (id_user, email, password_hash, role, nom_entreprise, telephone) VALUES
-- Administrateur
('11111111-1111-1111-1111-111111111111', 'admin@nextrade.com', '$2a$10$hashedpassword', 'ADMIN', 'NexTrade Admin', '+33 1 23 45 67 89'),
-- Fournisseur
('22222222-2222-2222-2222-222222222222', 'fournisseur@nextrade.com', '$2a$10$hashedpassword', 'FOURNISSEUR', 'TechFournisseur Inc.', '+33 2 34 56 78 90'),
-- Commerçant
('33333333-3333-3333-3333-333333333333', 'commercant@nextrade.com', '$2a$10$hashedpassword', 'COMMERCANT', 'Commercant Local', '+33 3 45 67 89 01'),
-- Client 1
('44444444-4444-4444-4444-444444444444', 'client1@nextrade.com', '$2a$10$hashedpassword', 'CLIENT', 'Client Entreprise A', '+33 4 56 78 90 12'),
-- Client 2
('55555555-5555-5555-5555-555555555555', 'client2@nextrade.com', '$2a$10$hashedpassword', 'CLIENT', 'Client Entreprise B', '+33 5 67 89 01 23'),
-- Transporteur
('66666666-6666-6666-6666-666666666666', 'transporteur@nextrade.com', '$2a$10$hashedpassword', 'TRANSPORTEUR', 'TransportRapide Ltd.', '+33 6 78 90 12 34');

-- 2. Products (Produit A, B, C, D)
INSERT INTO products (id_product, id_fournisseur, nom, description, categorie, prix_detail, prix_gros) VALUES
-- Produit A
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Ordinateur Portable Pro', 'Ordinateur portable haute performance pour professionnels', 'Informatique', 1299.99, 1199.99),
-- Produit B
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Smartphone Ultra', 'Smartphone dernier génération avec écran OLED', 'Télécommunications', 899.99, 829.99),
-- Produit C
('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Tablette Graphique', 'Tablette graphique pour artistes et designers', 'Informatique', 449.99, 419.99),
-- Produit D
('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'Imprimante Laser', 'Imprimante laser couleur vitesse élevée', 'Bureautique', 349.99, 329.99);

-- 3. Inventory (stock for each product)
INSERT INTO inventory (id_stock, id_product, quantite_disponible, seuil_alerte) VALUES
-- Stock for Produit A
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 50, 5),
-- Stock for Produit B
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 75, 10),
-- Stock for Produit C
('cccccccc-cccc-cccc-cccc-cccccccccccc1', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 30, 3),
-- Stock for Produit D
('dddddddd-dddd-dddd-dddd-dddddddddddd1', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 60, 8);

-- 4. Orders (2 commandes, une pour chaque client)
INSERT INTO orders (id_order, id_client, montant_total, statut, adresse_livraison) VALUES
-- Commande 1 pour client 1
('11111111-1111-1111-1111-111111111112', '44444444-4444-4444-4444-444444444444', 2249.97, 'PAYEE', '123 Rue de la Paix, 75002 Paris, France'),
-- Commande 2 pour client 2
('22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 1249.98, 'EXPEDIEE', '456 Avenue des Champs, 69001 Lyon, France');

-- 5. Order Items (lignes de commande)
INSERT INTO order_items (id_item, id_order, id_product, quantite, prix_unitaire_fige) VALUES
-- Ligne commande 1: 1 Ordinateur Portable Pro + 1 Smartphone Ultra
('11111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111112', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 1299.99),
('11111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111112', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, 899.99),
-- Ligne commande 2: 2 Tablettes Graphiques + 1 Imprimante Laser
('22222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 2, 449.99),
('22222222-2222-2222-2222-222222222224', '22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 1, 349.99);

-- 6. Transactions (paiements pour les commandes)
INSERT INTO transactions (id_transaction, id_order, montant_paye, methode_paiement, statut_transaction, reference_externe) VALUES
-- Paiement pour commande 1
('11111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111112', 2249.97, 'CARTE_CREDIT', 'VALIDEE', 'txn_123456789'),
-- Paiement pour commande 2
('22222222-2222-2222-2222-222222222225', '22222222-2222-2222-2222-222222222222', 1249.98, 'VIREMENT', 'VALIDEE', 'txn_987654321');

-- 7. Purchases (achats auprès du fournisseur)
INSERT INTO purchases (id_purchase, id_fournisseur, statut, montant_total) VALUES
-- Achat 1: stock initial
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaabc', '22222222-2222-2222-2222-222222222222', 'LIVREE', 6499.90);

-- 8. Purchase Items (articles de l'achat)
INSERT INTO purchase_items (id_purchase_item, id_purchase, id_product, quantite, prix_unitaire) VALUES
-- Achat de 10 unités de chaque produit pour le stock initial
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaabd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaabc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 10, 1299.99),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbe', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaabc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 10, 899.99),
('cccccccc-cccc-cccc-cccc-cccccccccccf', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaabc', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 10, 449.99),
('dddddddd-dddd-dddd-dddd-ddddddddddddg', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaabc', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 10, 349.99);

-- 9. Shipments (expéditions pour les commandes)
INSERT INTO shipments (id_shipment, id_order, transporteur_id, numero_suivi, mode_transport, statut, date_expedition, date_livraison_estimee, date_livraison_reelle) VALUES
-- Expédition pour commande 1
('11111111-1111-1111-1111-111111111116', '11111111-1111-1111-1111-111111111112', '66666666-6666-6666-6666-666666666666', 'TRK123456789FR', 'ROUTE', 'LIVREE', '2026-09-15 08:30:00+02', '2026-09-16 18:00:00+02', '2026-09-16 10:45:00+02'),
-- Expédition pour commande 2
('22222222-2222-2222-2222-222222222226', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'TRK987654321FR', 'AVION', 'LIVREE', '2026-09-16 14:00:00+02', '2026-09-17 09:00:00+02', '2026-09-17 08:30:00+02');

-- 10. Documents (documents associés aux opérations et commandes)
INSERT INTO documents (id_document, id_operation, id_order, type_document, nom_fichier, chemin_fichier, statut) VALUES
-- Facture commerciale pour commande 1
('11111111-1111-1111-1111-111111111117', NULL, '11111111-1111-1111-1111-111111111112', 'FACTURE_COMMERCIALE', 'facture_123.pdf', '/documents/facture_123.pdf', 'VALIDE'),
-- Liste de colisage pour commande 1
('11111111-1111-1111-1111-111111111118', NULL, '11111111-1111-1111-1111-111111111112', 'PACKING_LIST', 'packing_123.pdf', '/documents/packing_123.pdf', 'VALIDE'),
-- Facture commerciale pour commande 2
('22222222-2222-2222-2222-222222222227', NULL, '22222222-2222-2222-2222-222222222222', 'FACTURE_COMMERCIALE', 'facture_456.pdf', '/documents/facture_456.pdf', 'VALIDE');

-- 11. Invoices (factures)
INSERT INTO invoices (id_invoice, id_order, numero_facture, montant_ht, montant_tva, montant_ttc, statut, date_emission, date_echeance) VALUES
-- Facture pour commande 1
('11111111-1111-1111-1111-111111111119', '11111111-1111-1111-1111-111111111112', 'FAC-2026-001', 1874.98, 375.00, 2249.98, 'PAYEE', '2026-09-15', '2026-09-30'),
-- Facture pour commande 2
('22222222-2222-2222-2222-222222222229', '22222222-2222-2222-2222-222222222222', 'FAC-2026-002', 1041.65, 208.33, 1249.98, 'PAYEE', '2026-09-16', '2026-10-01');
