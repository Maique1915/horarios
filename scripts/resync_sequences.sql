-- Comprehensive script to resync ALL sequences in the database
-- Run this if you encounter "duplicate key value violates unique constraint" errors
DO $$
DECLARE row RECORD;
BEGIN FOR row IN
SELECT table_name,
    column_name
FROM information_schema.columns
WHERE column_default LIKE 'nextval%'
    AND table_schema = 'public' LOOP EXECUTE format(
        'SELECT setval(pg_get_serial_sequence(%L, %L), coalesce(max(%I), 1), max(%I) IS NOT null) FROM %I',
        row.table_name,
        row.column_name,
        row.column_name,
        row.column_name,
        row.table_name
    );
END LOOP;
END $$;