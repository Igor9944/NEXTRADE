# NexTrade Database Documentation

## Architecture

```text
Application
      ↓
Backend
      ↓
PostgreSQL
```

The NexTrade application uses a PostgreSQL database as its primary data store. The backend (Node.js/Express.js) communicates with the database using the `pg` library. Database schema management is handled through SQL migrations.

## Tables

### users
- **Objectif:** Store user accounts for all system roles (admin, client, supplier, merchant, transporter)
- **PK:** id_user (UUID)
- **FK:** None (referenced by other tables)
- **Champs principaux:**
  - email (VARCHAR, unique, not null)
  - password_hash (VARCHAR, not null)
  - role (VARCHAR, not null, check constraint)
  - nom_entreprise (VARCHAR)
  - telephone (VARCHAR)
  - created_at (TIMESTAMPTZ, default: now())
  - updated_at (TIMESTAMPTZ, default: now())
- **Contraintes:**
  - PRIMARY KEY (id_user)
  - UNIQUE (email)
  - CHECK (role IN ('ADMIN', 'CLIENT', 'FOURNISSEUR', 'COMMERCANT', 'TRANSPORTEUR'))

### products
- **Objectif:** Store product information supplied by vendors
- **PK:** id_product (UUID)
- **FK:** id_fournisseur → users(id_user)
- **Champs principaux:**
  - nom (VARCHAR, not null)
  - description (TEXT)
  - categorie (VARCHAR)
  - prix_detail (DECIMAL, not null, check >= 0)
  - prix_gros (DECIMAL, not null, check >= 0)
  - created_at (TIMESTAMPTZ, default: now())
  - updated_at (TIMESTAMPTZ, default: now())
- **Contraintes:**
  - PRIMARY KEY (id_product)
  - FOREIGN KEY (id_fournisseur) REFERENCES users(id_user) ON DELETE RESTRICT
  - CHECK (prix_detail >= 0)
  - CHECK (prix_gros >= 0)

### inventory
- **Objectif:** Track stock levels for each product
- **PK:** id_stock (UUID)
- **FK:** id_product → products(id_product)
- **Champs principaux:**
  - quantite_disponible (INTEGER, not null, check >= 0)
  - seuil_alerte (INTEGER, not null, check >= 0)
  - last_updated (TIMESTAMPTZ, default: now())
- **Contraintes:**
  - PRIMARY KEY (id_stock)
  - FOREIGN KEY (id_product) REFERENCES products(id_product) ON DELETE RESTRICT
  - UNIQUE (id_product) - One inventory record per product
  - CHECK (quantite_disponible >= 0)
  - CHECK (seuil_alerte >= 0)

### orders
- **Objectif:** Store customer orders
- **PK:** id_order (UUID)
- **FK:** id_client → users(id_user)
- **Champs principaux:**
  - montant_total (DECIMAL, not null, check >= 0)
  - statut (VARCHAR, not null, check constraint)
  - adresse_livraison (TEXT)
  - created_at (TIMESTAMPTZ, default: now())
  - updated_at (TIMESTAMPTZ, default: now())
- **Contraintes:**
  - PRIMARY KEY (id_order)
  - FOREIGN KEY (id_client) REFERENCES users(id_user) ON DELETE RESTRICT
  - CHECK (montant_total >= 0)
  - CHECK (statut IN ('EN_ATTENTE', 'PAYEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE', 'ANNULEE'))

### order_items
- **Objectif:** Store individual items within orders
- **PK:** id_item (UUID)
- **FK:** 
  - id_order → orders(id_order)
  - id_product → products(id_product)
- **Champs principaux:**
  - quantite (INTEGER, not null, check > 0)
  - prix_unitaire_fige (DECIMAL, not null, check >= 0)
  - created_at (TIMESTAMPTZ, default: now())
- **Contraintes:**
  - PRIMARY KEY (id_item)
  - FOREIGN KEY (id_order) REFERENCES orders(id_order) ON DELETE RESTRICT
  - FOREIGN KEY (id_product) REFERENCES products(id_product) ON DELETE RESTRICT
  - CHECK (quantite > 0)
  - CHECK (prix_unitaire_fige >= 0)

### transactions
- **Objectif:** Store payment transactions for orders
- **PK:** id_transaction (UUID)
- **FK:** id_order → orders(id_order)
- **Champs principaux:**
  - montant_paye (DECIMAL, not null, check >= 0)
  - methode_paiement (VARCHAR)
  - statut_transaction (VARCHAR, not null, check constraint)
  - reference_externe (VARCHAR)
  - created_at (TIMESTAMPTZ, default: now())
- **Contraintes:**
  - PRIMARY KEY (id_transaction)
  - FOREIGN KEY (id_order) REFERENCES orders(id_order) ON DELETE RESTRICT
  - CHECK (montant_paye >= 0)
  - CHECK (statut_transaction IN ('INITIEE', 'EN_ATTENTE', 'VALIDEE', 'ECHOUEE', 'REMBOURSEE'))

### purchases
- **Objectif:** Store purchase records from suppliers
- **PK:** id_purchase (UUID)
- **FK:** id_fournisseur → users(id_user)
- **Champs principaux:**
  - statut (VARCHAR, not null, check constraint)
  - montant_total (DECIMAL, not null, check >= 0)
  - created_at (TIMESTAMPTZ, default: now())
  - updated_at (TIMESTAMPTZ, default: now())
- **Contraintes:**
  - PRIMARY KEY (id_purchase)
  - FOREIGN KEY (id_fournisseur) REFERENCES users(id_user) ON DELETE RESTRICT
  - CHECK (montant_total >= 0)
  - CHECK (statut IN ('EN_ATTENTE', 'VALIDEE', 'ANNULEE'))

### purchase_items
- **Objectif:** Store individual items within purchase orders
- **PK:** id_purchase_item (UUID)
- **FK:** 
  - id_purchase → purchases(id_purchase)
  - id_product → products(id_product)
- **Champs principaux:**
  - quantite (INTEGER, not null, check > 0)
  - prix_unitaire (DECIMAL, not null, check >= 0)
  - created_at (TIMESTAMPTZ, default: now())
- **Contraintes:**
  - PRIMARY KEY (id_purchase_item)
  - FOREIGN KEY (id_purchase) REFERENCES purchases(id_purchase) ON DELETE RESTRICT
  - FOREIGN KEY (id_product) REFERENCES products(id_product) ON DELETE RESTRICT
  - CHECK (quantite > 0)
  - CHECK (prix_unitaire >= 0)

### import_export_operations
- **Objectif:** Track international trade operations (import/export)
- **PK:** id_operation (UUID)
- **FK:** id_order → orders(id_order)
- **Champs principaux:**
  - type_operation (VARCHAR, not null, check constraint)
  - pays_origine (VARCHAR)
  - pays_destination (VARCHAR)
  - statut (VARCHAR, not null, check constraint)
  - date_depart (DATE)
  - date_arrivee_prevue (DATE)
  - created_at (TIMESTAMPTZ, default: now())
  - updated_at (TIMESTAMPTZ, default: now())
- **Contraintes:**
  - PRIMARY KEY (id_operation)
  - FOREIGN KEY (id_order) REFERENCES orders(id_order) ON DELETE RESTRICT
  - CHECK (type_operation IN ('IMPORT', 'EXPORT'))
  - CHECK (statut IN ('PREPARATION', 'EXPEDIEE', 'EN_TRANSIT', 'ARRIVEE', 'DOUANE', 'LIVREE', 'ANNULEE'))

### shipments
- **Objectif:** Track delivery shipments for orders
- **PK:** id_shipment (UUID)
- **FK:** 
  - id_order → orders(id_order)
  - transporteur_id → users(id_user) (nullable)
- **Champs principaux:**
  - numero_suivi (VARCHAR)
  - mode_transport (VARCHAR)
  - statut (VARCHAR, not null, check constraint)
  - date_expedition (TIMESTAMPTZ)
  - date_livraison_estimee (TIMESTAMPTZ)
  - date_livraison_reelle (TIMESTAMPTZ)
  - created_at (TIMESTAMPTZ, default: now())
  - updated_at (TIMESTAMPTZ, default: now())
- **Contraintes:**
  - PRIMARY KEY (id_shipment)
  - FOREIGN KEY (id_order) REFERENCES orders(id_order) ON DELETE RESTRICT
  - FOREIGN KEY (transporteur_id) REFERENCES users(id_user) ON DELETE SET NULL
  - CHECK (statut IN ('PREPARATION', 'EXPEDIEE', 'EN_TRANSIT', 'ARRIVEE', 'DOUANE', 'LIVREE', 'ANNULEE'))

### documents
- **Objectif:** Store metadata for trade-related documents
- **PK:** id_document (UUID)
- **FK:** 
  - id_operation → import_export_operations(id_operation) (nullable)
  - id_order → orders(id_order) (nullable)
- **Champs principaux:**
  - type_document (VARCHAR, not null, check constraint)
  - nom_fichier (VARCHAR)
  - chemin_fichier (VARCHAR)
  - statut (VARCHAR, not null, check constraint)
  - created_at (TIMESTAMPTZ, default: now())
  - updated_at (TIMESTAMPTZ, default: now())
- **Contraintes:**
  - PRIMARY KEY (id_document)
  - FOREIGN KEY (id_operation) REFERENCES import_export_operations(id_operation) ON DELETE SET NULL
  - FOREIGN KEY (id_order) REFERENCES orders(id_order) ON DELETE SET NULL
  - CHECK (type_document IN ('FACTURE_COMMERCIALE', 'PACKING_LIST', 'CERTIFICAT_ORIGINE', 'DOCUMENT_DOUANE', 'DOCUMENT_TRANSPORT', 'AUTRE'))
  - CHECK (statut IN ('ACTIF', 'ARCHIVE', 'SUPPRIME'))

### invoices
- **Objectif:** Store invoices generated from orders
- **PK:** id_invoice (UUID)
- **FK:** id_order → orders(id_order)
- **Champs principaux:**
  - numero_facture (VARCHAR, not null, unique)
  - montant_ht (DECIMAL, not null, check >= 0)
  - montant_tva (DECIMAL, not null, check >= 0)
  - montant_ttc (DECIMAL, not null, check >= 0)
  - statut (VARCHAR, not null, check constraint)
  - date_emission (DATE)
  - date_echeance (DATE)
  - created_at (TIMESTAMPTZ, default: now())
- **Contraintes:**
  - PRIMARY KEY (id_invoice)
  - FOREIGN KEY (id_order) REFERENCES orders(id_order) ON DELETE RESTRICT
  - UNIQUE (numero_facture)
  - CHECK (montant_ht >= 0)
  - CHECK (montant_tva >= 0)
  - CHECK (montant_ttc >= 0)
  - CHECK (statut IN ('BROUILLON', 'ENVOYEE', 'PAYEE', 'ANNULEE'))

## Relations

### Key Relationships

1. **User-Centric Relationships:**
   - Users (as suppliers) → Products (one-to-many)
   - Users (as clients) → Orders (one-to-many)
   - Users (as transporters) → Shipments (one-to-many, nullable FK)

2. **Product-Centric Relationships:**
   - Products ← Inventory (one-to-one)
   - Products → Order Items (one-to-many)
   - Products → Purchase Items (one-to-many)

3. **Order-Centric Relationships:**
   - Orders → Order Items (one-to-many)
   - Orders → Transactions (one-to-many)
   - Orders → Shipments (one-to-many)
   - Orders → Documents (one-to-many, via direct FK)
   - Orders → Import/Export Operations (one-to-many)
   - Orders → Invoices (one-to-many)

4. **Purchase-Centric Relationships:**
   - Purchases → Purchase Items (one-to-many)
   - Purchases ← Users (as suppliers) (many-to-one)

5. **Trade Operation-Centric Relationships:**
   - Import/Export Operations ← Orders (many-to-one)
   - Import/Export Operations → Documents (one-to-many)

6. **Document Relationships:**
   - Documents can be linked to either an Import/Export Operation or an Order (both nullable)

### Relationship Summary
- **Users** are central to the system, serving as suppliers, clients, and transporters
- **Products** flow from suppliers through inventory to customers via orders
- **Orders** generate multiple downstream records: payments, shipments, documents, and invoices
- **Purchases** represent the upstream flow from suppliers to replenish inventory
- **Import/Export Operations** track international shipments linked to orders
- **Documents** store metadata for various trade documents associated with operations or orders

## Index

### Existing Indexes (Implicit from PK/FK/Unique Constraints)
1. **users_pkey** - PRIMARY KEY on users(id_user)
2. **users_email_key** - UNIQUE on users(email)
3. **products_pkey** - PRIMARY KEY on products(id_product)
4. **inventory_pkey** - PRIMARY KEY on inventory(id_stock)
5. **inventory_id_product_key** - UNIQUE on inventory(id_product)
6. **orders_pkey** - PRIMARY KEY on orders(id_order)
7. **order_items_pkey** - PRIMARY KEY on order_items(id_item)
8. **transactions_pkey** - PRIMARY KEY on transactions(id_transaction)
9. **purchases_pkey** - PRIMARY KEY on purchases(id_purchase)
10. **purchase_items_pkey** - PRIMARY KEY on purchase_items(id_purchase_item)
11. **import_export_operations_pkey** - PRIMARY KEY on import_export_operations(id_operation)
12. **shipments_pkey** - PRIMARY KEY on shipments(id_shipment)
13. **documents_pkey** - PRIMARY KEY on documents(id_document)
14. **invoices_pkey** - PRIMARY KEY on invoices(id_invoice)
15. **invoices_numero_facture_key** - UNIQUE on invoices(numero_facture)

### Foreign Key Indexes (Automatically Created in PostgreSQL)
16. **fk_products_fournisseur_idx** - on products(id_fournisseur)
17. **fk_inventory_product_idx** - on inventory(id_product)
18. **fk_order_items_order_idx** - on order_items(id_order)
19. **fk_order_items_product_idx** - on order_items(id_product)
20. **fk_transactions_order_idx** - on transactions(id_order)
21. **fk_purchases_fournisseur_idx** - on purchases(id_fournisseur)
22. **fk_purchase_items_purchase_idx** - on purchase_items(id_purchase)
23. **fk_purchase_items_product_idx** - on purchase_items(id_product)
24. **fk_import_export_order_idx** - on import_export_operations(id_order)
25. **fk_shipments_order_idx** - on shipments(id_order)
26. **fk_shipments_transporteur_idx** - on shipments(transporteur_id)
27. **fk_documents_operation_idx** - on documents(id_operation)
28. **fk_documents_order_idx** - on documents(id_order)
29. **fk_invoices_order_idx** - on invoices(id_order)

### Recommended Additional Indexes for Query Performance
30. **idx_users_role** - on users(role) - For filtering users by role
31. **idx_products_categorie** - on products(categorie) - For filtering products by category
32. **idx_orders_statut** - on orders(statut) - For filtering orders by status
33. **idx_orders_created_at** - on orders(created_at) - For sorting orders by date
34. **idx_orders_id_client** - on orders(id_client) - For finding user's orders (already covered by FK)
35. **idx_inventory_quantite_disponible** - on inventory(quantite_disponible) - For low stock alerts
36. **idx_shipments_statut** - on shipments(statut) - For filtering shipments by status
37. **idx_shipments_numero_suivi** - on shipments(numero_suivi) - For tracking lookup
38. **idx_documents_type_document** - on documents(type_document) - For filtering by document type
39. **idx_documents_statut** - on documents(statut) - For filtering document status
40. **idx_invoices_statut** - on invoices(statut) - For filtering invoice status
41. **idx_invoices_date_emission** - on invoices(date_emission) - For sorting invoices by date
42. **idx_invoices_date_echeance** - on invoices(date_echeance) - For finding upcoming due dates

## Migrations

### Migration Files
The following SQL migration files are located in `/home/ro0t_h4ck/NEXTRADE/database/migrations/`:
1. 001_create_users.sql
2. 002_create_products.sql
3. 003_create_inventory.sql
4. 004_create_orders.sql
5. 005_create_order_items.sql
6. 006_create_transactions.sql
7. 007_create_purchases.sql
8. 008_create_purchase_items.sql
9. 009_create_import_export_operations.sql
10. 010_create_shipments.sql
11. 011_create_documents.sql
12. 012_create_invoices.sql

### Migration Procedure
1. Ensure PostgreSQL is running and the `nextrade` database exists
2. Configure database credentials in backend/.env and ai/.env
3. Apply migrations using your preferred method (see "Migration Tools" below)
4. Verify all tables are created correctly

### Migration Tools
While the project includes `umzug` as a dependency in the backend, no explicit migration scripts are configured. Migrations can be applied via:

**Option 1: Direct SQL Execution**
```bash
# Apply all migrations in order
for migration in database/migrations/*.sql; do
  echo "Applying $ migration"
  PGPASSWORD=nextrade_password psql -h localhost -U nextrade -d nextrade -f "$ migration"
done
```

**Option 2: Using umzug (Node.js)**
Create a migration script in the backend that uses the umzug library to manage the SQL files.

**Option 3: Manual Application**
Apply each migration file individually in numerical order using psql or a GUI tool.

### Rollback Procedure
To rollback migrations, execute the DOWN versions of the migration scripts in reverse order. Since these migrations don't include explicit DOWN statements, you would need to:
1. Drop tables in reverse dependency order (considering foreign key constraints)
2. Or recreate the database from scratch

Note: The current migration files only contain CREATE TABLE statements with IF NOT EXISTS clauses, making them safe to reapply but not designed for easy rollback.

## Seeding

### Seed Files
The following seed data files are located in `/home/ro0t_h4ck/NEXTRADE/database/seeds/`:
1. 01_seed_data.sql - Complete dataset
2. 01_users_only.sql - Users only
3. 02_products_only.sql - Products only
4. 03_inventory_only.sql - Inventory only

### Seeding Procedure
1. Ensure migrations have been applied and tables exist
2. Execute seed files in dependency order:
   ```bash
   # Option A: Complete dataset
   PGPASSWORD=nextrade_password psql -h localhost -U nextrade -d nextrade -f database/seeds/01_seed_data.sql
   
   # Option B: Individual components (in order)
   PGPASSWORD=nextrade_password psql -h localhost -U nextrade -d nextrade -f database/seeds/01_users_only.sql
   PGPASSWORD=nextrade_password psql -h localhost -U nextrade -d nextrade -f database/seeds/02_products_only.sql
   PGPASSWORD=nextrade_password psql -h localhost -U nextrade -d nextrade -f database/seeds/03_inventory_only.sql
   # Then execute remaining tables from 01_seed_data.sql starting from orders
   ```
3. Verify data insertion was successful

### Current Seed Data Status
As of the latest check:
- ✅ users: 6 records (complete)
- ✅ products: 4 records (complete)
- ⚠️ inventory: 4 records but with incorrect id_stock values (see Issues)
- ❌ orders: 1 of 2 expected records
- ❌ order_items: 0 of 4 expected records
- ❌ transactions: 0 of 2 expected records
- ❌ purchases: 0 of 1 expected record
- ❌ purchase_items: 0 of 4 expected records
- ❌ shipments: 0 of 2 expected records
- ❌ documents: 0 of 3 expected records
- ❌ invoices: 0 of 2 expected records

## Reset Procedure

To reset the database to a clean state:

### Option 1: Drop and Recreate Database
```bash
# Drop the database
sudo -u postgres psql -c "DROP DATABASE IF EXISTS nextrade;"

# Recreate the database
sudo -u postgres psql -c "CREATE DATABASE nextrade;"

# Recreate the user and grant privileges
sudo -u postgres psql -c "CREATE USER nextrade WITH PASSWORD 'nextrade_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE nextrade TO nextrade;"

# Apply migrations
# (See Migration Procedure above)

# Apply seed data
# (See Seeding Procedure above)
```

### Option 2: Truncate All Tables
```bash
# Truncate tables in reverse dependency order to avoid FK constraints
PGPASSWORD=nextrade_password psql -h localhost -U nextrade -d nextrade -c "
TRUNCATE TABLE 
  invoices, 
  documents, 
  shipments, 
  import_export_operations, 
  purchase_items, 
  purchases, 
  transactions, 
  order_items, 
  orders, 
  inventory, 
  products, 
  users 
RESTART IDENTITY CASCADE;
```

Then apply seed data as described above.

## Verification Steps

After setting up the database, verify:

### 1. Connection
```bash
PGPASSWORD=nextrade_password psql -h localhost -U nextrade -d nextrade -c "SELECT version();"
```

### 2. Table Existence
```bash
PGPASSWORD=nextrade_password psql -h localhost -U nextrade -d nextrade -c "\dt"
```

### 3. Record Counts
```bash
# Example for users table
PGPASSWORD=nextrade_password psql -h localhost -U nextrade -d nextrade -c "SELECT COUNT(*) FROM users;"
# Repeat for each table
```

### 4. Constraints
Test that constraints work correctly:
- Try to insert duplicate email in users (should fail)
- Try to insert negative quantity in inventory (should fail)
- Try to insert invalid role in users (should fail)
- Try to insert order with non-existent client (should fail due to FK)

### 5. Relationships
Verify foreign key relationships:
- Check that order items reference valid orders and products
- Check that transactions reference valid orders
- etc.

### 6. Backend Connectivity
Ensure the backend can connect and query the database:
```bash
cd backend
npm run dev  # In one terminal
# In another terminal:
curl http://localhost:3000/health  # Assuming health endpoint exists
```
