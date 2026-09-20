-- Truncate tables from orders onward to prepare for reseeding
-- Order is important to avoid foreign key constraint violations

TRUNCATE TABLE order_items;
TRUNCATE TABLE transactions;
TRUNCATE TABLE purchase_items;
TRUNCATE TABLE shipments;
TRUNCATE TABLE documents;
TRUNCATE TABLE invoices;
TRUNCATE TABLE import_export_operations;
TRUNCATE TABLE orders;
TRUNCATE TABLE purchases;
