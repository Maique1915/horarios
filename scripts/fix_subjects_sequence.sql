-- Fix primary key sequence for subjects table
-- Run this before running the insert script.
-- This command synchronizes the sequence with the actual maximum ID in the table.
-- We check for both 'subjects_id_seq' and 'subjects_new_id_seq' just in case.
DO $$ BEGIN -- Sync subjects_id_seq if it exists
IF EXISTS (
    SELECT 1
    FROM pg_class
    WHERE relname = 'subjects_id_seq'
) THEN PERFORM setval(
    'subjects_id_seq',
    (
        SELECT MAX(id)
        FROM subjects
    )
);
END IF;
-- Sync subjects_new_id_seq if it exists (suggested by the constraint name in error)
IF EXISTS (
    SELECT 1
    FROM pg_class
    WHERE relname = 'subjects_new_id_seq'
) THEN PERFORM setval(
    'subjects_new_id_seq',
    (
        SELECT MAX(id)
        FROM subjects
    )
);
END IF;
END $$;