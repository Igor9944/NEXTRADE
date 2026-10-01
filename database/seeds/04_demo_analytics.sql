-- Deterministic demo dataset for dashboard charts (no personal production data)
-- Password for demo users: ClientPass123!

INSERT INTO users (
  id_user, email, password_hash, role, nom_entreprise, telephone, nom, prenom, adresse, ville, pays, ui_language, assistant_language
) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'demo.admin@nextrade.test',
   '$2b$10$M9TMIL3MeO3Hg3t2cAWNeeYiK9InylOAn4kr2x85Qgshx7uemxrwS',
   'ADMIN', 'NexTrade Demo', '+22890000001', 'Admin', 'Demo', 'Lome', 'Lome', 'Togo', 'fr', 'fr'),
  ('a1000000-0000-4000-8000-000000000002', 'demo.client@nextrade.test',
   '$2b$10$M9TMIL3MeO3Hg3t2cAWNeeYiK9InylOAn4kr2x85Qgshx7uemxrwS',
   'CLIENT', 'Client Demo', '+22890000002', 'Client', 'Demo', 'Lome', 'Lome', 'Togo', 'fr', 'en'),
  ('a1000000-0000-4000-8000-000000000003', 'demo.supplier@nextrade.test',
   '$2b$10$M9TMIL3MeO3Hg3t2cAWNeeYiK9InylOAn4kr2x85Qgshx7uemxrwS',
   'FOURNISSEUR', 'Supplier Demo', '+22890000003', 'Fournisseur', 'Demo', 'Lome', 'Lome', 'Togo', 'en', 'ar'),
  ('a1000000-0000-4000-8000-000000000004', 'demo.clientb@nextrade.test',
   '$2b$10$M9TMIL3MeO3Hg3t2cAWNeeYiK9InylOAn4kr2x85Qgshx7uemxrwS',
   'CLIENT', 'Client B Demo', '+22890000004', 'Client', 'Beta', 'Kara', 'Kara', 'Togo', 'en', 'fr'),
  ('a1000000-0000-4000-8000-000000000005', 'demo.carrier@nextrade.test',
   '$2b$10$M9TMIL3MeO3Hg3t2cAWNeeYiK9InylOAn4kr2x85Qgshx7uemxrwS',
   'TRANSPORTEUR', 'Carrier Demo', '+22890000005', 'Transporteur', 'Demo', 'Lome', 'Lome', 'Togo', 'ar', 'fr'),
  ('a1000000-0000-4000-8000-000000000006', 'demo.commercant@nextrade.test',
   '$2b$10$M9TMIL3MeO3Hg3t2cAWNeeYiK9InylOAn4kr2x85Qgshx7uemxrwS',
   'COMMERCANT', 'Commercant Demo', '+22890000006', 'Commercant', 'Demo', 'Lome', 'Lome', 'Togo', 'fr', 'ar')
ON CONFLICT (id_user) DO NOTHING;

INSERT INTO products (id_product, id_fournisseur, nom, description, categorie, prix_detail, prix_gros)
VALUES
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000003', 'Demo Cacao 50kg', 'Lot demo cacao', 'Agro', 1200, 1000),
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000003', 'Demo Textile', 'Lot demo textile', 'Textile', 800, 650),
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000003', 'Demo Electronique', 'Lot demo electronique', 'Tech', 1500, 1300)
ON CONFLICT (id_product) DO NOTHING;

INSERT INTO inventory (id_product, quantite_disponible, seuil_alerte)
VALUES
  ('b1000000-0000-4000-8000-000000000001', 80, 10),
  ('b1000000-0000-4000-8000-000000000002', 4, 10),
  ('b1000000-0000-4000-8000-000000000003', 0, 5)
ON CONFLICT (id_product) DO UPDATE SET
  quantite_disponible = EXCLUDED.quantite_disponible,
  seuil_alerte = EXCLUDED.seuil_alerte;

INSERT INTO supplier_profiles (
  user_id, description, identifiant_professionnel, statut_verification, email_professionnel
) VALUES (
  'a1000000-0000-4000-8000-000000000003',
  'Fournisseur demo cacao / textile',
  'SUP-DEMO-001',
  'VERIFIE',
  'demo.supplier@nextrade.test'
) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO orders (id_order, id_client, montant_total, statut, adresse_livraison, created_at)
VALUES
  ('c1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000002', 3600, 'PAYEE', 'Lome', NOW() - INTERVAL '3 days'),
  ('c1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000002', 1600, 'EN_ATTENTE', 'Lome', NOW() - INTERVAL '20 days'),
  ('c1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000002', 3000, 'LIVREE', 'Kara', NOW() - INTERVAL '40 days'),
  ('c1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000002', 1500, 'ANNULEE', 'Lome', NOW() - INTERVAL '8 days')
ON CONFLICT (id_order) DO NOTHING;

INSERT INTO order_items (id_order, id_product, quantite, prix_unitaire_fige)
SELECT 'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 3, 1200
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE id_order = 'c1000000-0000-4000-8000-000000000001');
INSERT INTO order_items (id_order, id_product, quantite, prix_unitaire_fige)
SELECT 'c1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000002', 2, 800
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE id_order = 'c1000000-0000-4000-8000-000000000002');
INSERT INTO order_items (id_order, id_product, quantite, prix_unitaire_fige)
SELECT 'c1000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000003', 2, 1500
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE id_order = 'c1000000-0000-4000-8000-000000000003');

INSERT INTO transactions (id_transaction, id_order, montant_paye, methode_paiement, statut_transaction, reference_externe, created_at)
VALUES
  ('d1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 3600, 'SANDBOX', 'VALIDEE', 'demo_ok_1', NOW() - INTERVAL '3 days'),
  ('d1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000002', 1600, 'SANDBOX', 'ECHOUEE', 'demo_fail_1', NOW() - INTERVAL '19 days')
ON CONFLICT (id_transaction) DO NOTHING;

INSERT INTO shipments (id_shipment, id_order, statut, date_expedition, date_livraison_estimee, origin, destination, reference_shipment)
VALUES
  ('e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000003', 'EN_TRANSIT', NOW() - INTERVAL '12 days', NOW() - INTERVAL '2 days', 'Lome', 'Kara', 'SHP-DEMO-000001')
ON CONFLICT (id_shipment) DO NOTHING;
