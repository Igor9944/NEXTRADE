# NexTrade Database Fixes

This document provides instructions to correct the issues identified in the database setup.

## Issues Identified

1. **Inventory ID Mismatch**: Inventory table has incorrect `id_stock` values (matching user IDs instead of seed values)
2. **Incomplete Seed Data**: Seed data application stopped after inventory table, leaving orders and beyond mostly empty or incomplete

## Prerequisites

- PostgreSQL is running and accessible
- Database `nextrade` exists
- Backend credentials are configured (from docker-compose.yml):
  - DB_HOST=localhost
  - DB_PORT=5432
  - DB_NAME=nextrade
  - DB_USER=nextrade
  - DB_PASSWORD=nextrade_password

## Step-by-Step Fix Procedure

### Step 1: Fix Inventory IDs

Execute the following SQL to correct the inventory table IDs:

```bash
PSQL="PGPASSWORD=nextrade_password psql -h localhost -U nextrade -d nextrade"

$PSQL -f fix_inventory_ids.sql
```

This updates the `id_stock` values in the inventory table to match the UUIDs specified in the seed data.

### Step 2: Prepare for Reseeding

Truncate tables from orders onward to avoid constraint violations when reseeding:

```bash
$PSQL -f truncate_from_orders_onward.sql
```

This clears all data from tables that depend on orders, preparing them for fresh seed data.

### Step 3: Apply Remaining Seed Data

Extract and execute the orders section and beyond from the seed file:

```bash
# Extract orders section and beyond from seed file
sed -n '/-- 4. Orders/,$p' database/seeds/01_seed_data.sql > /tmp/remaining_seed.sql

# Execute the extracted seed data
$PSQL -f /tmp/remaining_seed.sql

# Clean up temporary file
rm -f /tmp/remaining_seed.sql
```

### Alternative: Direct Section Extraction

If the sed command doesn't work as expected, you can manually create the seed file by copying from `database/seeds/01_seed_data.sql` starting at the line containing "-- 4. Orders" through the end of the file.

## Verification

After applying the fixes, run these verification queries:

```bash
# Check record counts
echo "Users:" && $PSQL -c "SELECT COUNT(*) FROM users;"
echo "Products:" && $PSQL -c "SELECT COUNT(*) FROM products;"
echo "Inventory:" && $PSQL -c "SELECT COUNT(*) FROM inventory;"
echo "Orders:" && $PSQL -c "SELECT COUNT(*) FROM orders;"
echo "Order Items:" && $PSQL -c "SELECT COUNT(*) FROM order_items;"
echo "Transactions:" && $PSQL -c "SELECT COUNT(*) FROM transactions;"
echo "Purchases:" && $PSQL -c "SELECT COUNT(*) FROM purchases;"
echo "Purchase Items:" && $PSQL -c "SELECT COUNT(*) FROM purchase_items;"
echo "Shipments:" && $PSQL -c "SELECT COUNT(*) FROM shipments;"
echo "Documents:" && $PSQL -c "SELECT COUNT(*) FROM documents;"
echo "Invoices:" && $PSQL -c "SELECT COUNT(*) FROM invoices;"

# Verify inventory IDs are correct
echo -e "\nInventory ID Verification:"
$PSQL -c "SELECT id_product, id_stock FROM inventory ORDER BY id_product;"

# Verify a few order details
echo -e "\nOrder Verification:"
$PSQL -c "SELECT id_order, id_client, statut FROM orders ORDER BY id_order;"
```

## Expected Results After Fixes

- users: 6 records
- products: 4 records  
- inventory: 4 records (with correct UUIDs matching seed)
- orders: 2 records
- order_items: 4 records
- transactions: 2 records
- purchases: 1 record
- purchase_items: 4 records
- shipments: 2 records
- documents: 3 records
- invoices: 2 records

## Troubleshooting

### Duplicate Key Errors
If you encounter duplicate key errors when applying seed data:
1. Ensure you ran the truncation step first
2. Verify you're extracting the correct section of the seed file
3. Check that no data remains in the truncated tables

### Foreign Key Errors
If you encounter foreign key constraint errors:
1. Verify that the truncation order was followed correctly
2. Ensure users and products tables still have their seed data (they should not be truncated)
3. Check that the inventory fix was applied successfully

## Files Created for This Fix

- `fix_inventory_ids.sql` - SQL to correct inventory ID mismatch
- `truncate_from_orders_onward.sql` - SQL to truncate tables for reseeding
- `APPLY_FIXES.md` - This document

## Notes

- These fixes assume the users and products tables contain correct seed data (verified as correct)
- The inventory fix preserves existing relationships - products will still link to the correct inventory records
- After applying these fixes, the database will match the expected state from the complete seed data
