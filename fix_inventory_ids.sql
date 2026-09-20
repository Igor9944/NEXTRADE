-- Fix inventory IDs to match seed data
UPDATE inventory 
SET id_stock = 
    CASE 
        WHEN id_product = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' THEN 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab1'
        WHEN id_product = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' THEN 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb1'
        WHEN id_product = 'cccccccc-cccc-cccc-cccc-cccccccccccc' THEN 'cccccccc-cccc-cccc-cccc-cccccccccccc1'
        WHEN id_product = 'dddddddd-dddd-dddd-dddd-dddddddddddd' THEN 'dddddddd-dddd-dddd-dddd-dddddddddddd1'
    END
WHERE id_product IN (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
);
